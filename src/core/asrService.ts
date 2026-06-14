/**
 * ASR (Automatic Speech Recognition) Service
 * 讯飞实时语音听写接口预留层
 * 
 * 重要说明：
 * - 前端不保存讯飞密钥（APPID、APIKey、APISecret）
 * - 前端不直接连接讯飞 WebSocket
 * - 前端只通过 VITE_ASR_API_URL 调用自有后端代理
 * - 未配置云端 ASR 时，浏览器识别和调试输入仍可用
 */

export type LanguageMode = 'auto' | 'zh' | 'en';
export type ASRProvider = 'browser' | 'xunfei' | 'auto';
export type DetectedLanguage = 'zh' | 'en' | 'mixed' | 'unknown';

export interface ASRParams {
  audioBlob: Blob;
  languageMode: LanguageMode;
  provider: ASRProvider;
}

export interface ASRResult {
  text: string;
  language?: DetectedLanguage;
  provider: 'browser' | 'xunfei' | 'mock';
  confidence?: number;
  error?: string;
}

export interface ASRConfig {
  apiUrl?: string;
  isConfigured: boolean;
}

/**
 * 获取 ASR 配置状态
 */
export function getASRConfig(): ASRConfig {
  const apiUrl = import.meta.env.VITE_ASR_API_URL as string | undefined;
  return {
    apiUrl,
    isConfigured: !!apiUrl,
  };
}

type WindowWithWebkitAudioContext = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

const XUNFEI_TARGET_SAMPLE_RATE = 16000;

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function mixToMono(audioBuffer: AudioBuffer): Float32Array {
  const output = new Float32Array(audioBuffer.length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const input = audioBuffer.getChannelData(channel);
    for (let index = 0; index < input.length; index += 1) {
      output[index] += input[index] / audioBuffer.numberOfChannels;
    }
  }

  return output;
}

function resampleLinear(
  input: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return input;
  }

  const targetLength = Math.max(
    1,
    Math.round((input.length * targetSampleRate) / sourceSampleRate)
  );
  const output = new Float32Array(targetLength);
  const ratio = sourceSampleRate / targetSampleRate;

  for (let index = 0; index < targetLength; index += 1) {
    const sourceIndex = index * ratio;
    const leftIndex = Math.floor(sourceIndex);
    const rightIndex = Math.min(leftIndex + 1, input.length - 1);
    const weight = sourceIndex - leftIndex;
    const left = input[leftIndex] || 0;
    const right = input[rightIndex] || 0;
    output[index] = left + (right - left) * weight;
  }

  return output;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = headerSize;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

async function convertAudioBlobToXunfeiWav(audioBlob: Blob): Promise<Blob> {
  const mimeType = audioBlob.type.toLowerCase();
  if (mimeType.includes('wav') || mimeType.includes('l16') || mimeType.includes('pcm')) {
    return audioBlob;
  }

  const AudioContextConstructor =
    window.AudioContext || (window as WindowWithWebkitAudioContext).webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error('Browser cannot convert recorded audio for cloud ASR.');
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const audioContext = new AudioContextConstructor();

  try {
    const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const monoSamples = mixToMono(decoded);
    const resampled = resampleLinear(
      monoSamples,
      decoded.sampleRate,
      XUNFEI_TARGET_SAMPLE_RATE
    );
    return encodeWav(resampled, XUNFEI_TARGET_SAMPLE_RATE);
  } finally {
    await audioContext.close().catch(() => undefined);
  }
}

/**
 * 调用云端 ASR 服务（讯飞实时语音听写）
 * 
 * 后端接口约定：
 * POST VITE_ASR_API_URL
 * FormData:
 *   - audio: 音频文件
 *   - languageMode: 语言模式
 * 
 * 返回：
 *   {
 *     "text": "画一个红色圆形",
 *     "language": "zh",
 *     "confidence": 0.95
 *   }
 */
export async function transcribeWithXunfei(
  audioBlob: Blob,
  languageMode: LanguageMode
): Promise<ASRResult> {
  const config = getASRConfig();
  
  if (!config.isConfigured || !config.apiUrl) {
    return {
      text: '',
      provider: 'mock',
      error: '未配置云端 ASR 服务（VITE_ASR_API_URL），请使用浏览器识别或调试输入',
    };
  }
  
  try {
    const uploadBlob = await convertAudioBlobToXunfeiWav(audioBlob);
    const formData = new FormData();
    formData.append('audio', uploadBlob, 'audio.wav');
    formData.append('languageMode', languageMode);
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        text: '',
        provider: 'mock',
        error: `云端 ASR 服务错误: ${response.status} ${errorText}`,
      };
    }
    
    const data = await response.json();
    
    return {
      text: data.text || '',
      language: data.language || 'unknown',
      provider: 'xunfei',
      confidence: data.confidence || 0,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '网络请求失败';
    return {
      text: '',
      provider: 'mock',
      error: `云端 ASR 请求失败: ${errorMsg}`,
    };
  }
}

/**
 * 统一的语音识别入口
 * 
 * 逻辑：
 * 1. 如果 provider 为 'xunfei' 且配置了 VITE_ASR_API_URL，使用讯飞
 * 2. 如果 provider 为 'browser'，返回提示使用浏览器识别
 * 3. 如果 provider 为 'auto'，优先尝试讯飞，失败时回退到浏览器识别
 * 4. 未配置云端 ASR 时，返回提示使用浏览器识别或调试输入
 */
export async function transcribeAudio(params: ASRParams): Promise<ASRResult> {
  const { audioBlob, languageMode, provider } = params;
  const config = getASRConfig();
  
  // 根据 provider 选择识别方式
  if (provider === 'xunfei') {
    if (!config.isConfigured) {
      return {
        text: '',
        provider: 'mock',
        error: '未配置云端 ASR，请切换到浏览器识别模式或使用调试输入',
      };
    }
    return transcribeWithXunfei(audioBlob, languageMode);
  }
  
  if (provider === 'browser') {
    // 浏览器识别由 useSpeechRecognition hook 处理
    return {
      text: '',
      provider: 'browser',
      error: '浏览器识别模式请在 VoicePanel 中直接使用语音按钮',
    };
  }
  
  // auto 模式：优先讯飞，失败时回退
  if (provider === 'auto') {
    if (config.isConfigured) {
      const xunfeiResult = await transcribeWithXunfei(audioBlob, languageMode);
      if (xunfeiResult.text && !xunfeiResult.error) {
        return xunfeiResult;
      }
      // 讯飞失败，回退到浏览器识别提示
      return {
        text: '',
        provider: 'browser',
        error: '云端 ASR 失败，请使用浏览器识别或调试输入',
      };
    }
    
    // 未配置云端 ASR，回退到浏览器识别
    return {
      text: '',
      provider: 'browser',
      error: '未配置云端 ASR，请使用浏览器识别或调试输入',
    };
  }
  
  return {
    text: '',
    provider: 'mock',
    error: '未知的识别模式',
  };
}

/**
 * ASR 状态管理
 */
export interface ASRStatus {
  currentProvider: ASRProvider;
  currentLanguageMode: LanguageMode;
  isConfigured: boolean;
  lastResult?: {
    text: string;
    provider: 'browser' | 'xunfei' | 'mock';
    language?: DetectedLanguage;
    confidence?: number;
    timestamp: number;
  };
}

// 默认状态
const defaultASRStatus: ASRStatus = {
  currentProvider: 'auto',
  currentLanguageMode: 'auto',
  isConfigured: getASRConfig().isConfigured,
};

// 状态存储（使用 localStorage 持久化）
const ASR_STATUS_KEY = 'speaksketch_asr_status';

function saveASRStatus(status: ASRStatus): void {
  try {
    localStorage.setItem(ASR_STATUS_KEY, JSON.stringify(status));
  } catch (error) {
    console.warn('ASR status persistence failed', error);
  }
}

export function getASRStatus(): ASRStatus {
  try {
    const stored = localStorage.getItem(ASR_STATUS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultASRStatus,
        ...parsed,
        isConfigured: getASRConfig().isConfigured, // 每次重新检查配置状态
      };
    }
  } catch {
    // 忽略解析错误
  }
  return defaultASRStatus;
}

export function setASRProvider(provider: ASRProvider): void {
  const status = getASRStatus();
  status.currentProvider = provider;
  saveASRStatus(status);
}

export function setASRLanguageMode(mode: LanguageMode): void {
  const status = getASRStatus();
  status.currentLanguageMode = mode;
  saveASRStatus(status);
}

export function recordASRResult(result: ASRResult): void {
  const status = getASRStatus();
  status.lastResult = {
    text: result.text,
    provider: result.provider,
    language: result.language,
    confidence: result.confidence,
    timestamp: Date.now(),
  };
  saveASRStatus(status);
}
