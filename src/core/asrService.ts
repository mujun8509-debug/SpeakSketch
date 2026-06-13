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
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
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
