import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isSupported: boolean;
  duration: number;
  error?: string;
}

export interface UseAudioRecorderResult {
  isRecording: boolean;
  isSupported: boolean;
  duration: number;
  error?: string;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
}

/**
 * 音频录制 Hook
 * 用于录制语音指令音频，供 ASR 服务识别
 */
export function useAudioRecorder(): UseAudioRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | undefined>();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 检查浏览器支持
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // 检查 MediaRecorder 支持
        if (!window.MediaRecorder) {
          setIsSupported(false);
          setError('浏览器不支持音频录制');
          return;
        }
        
        // 检查支持的音频格式
        const mimeTypes = [
          'audio/webm',
          'audio/webm;codecs=opus',
          'audio/ogg;codecs=opus',
          'audio/mp4',
        ];
        
        let supportedMimeType = '';
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            supportedMimeType = mimeType;
            break;
          }
        }
        
        if (!supportedMimeType) {
          setIsSupported(false);
          setError('浏览器不支持可用的音频格式');
          return;
        }
        
        // 仅检查能力，不在初始化阶段请求麦克风权限
        if (!navigator.mediaDevices?.getUserMedia) {
          setIsSupported(false);
          setError('浏览器不支持麦克风录制，请使用浏览器识别或调试输入');
          return;
        }

        setIsSupported(true);
        setError(undefined);
      } catch {
        setIsSupported(false);
        setError('无法检测音频录制支持');
      }
    };
    
    checkSupport();
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording) {
      return;
    }
    
    if (!isSupported) {
      setError('浏览器不支持音频录制，请使用浏览器识别或调试输入');
      return;
    }
    
    try {
      setError(undefined);
      audioChunksRef.current = [];

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('浏览器不支持麦克风录制，请使用浏览器识别或调试输入');
        return;
      }
      
      // 获取麦克风流
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;
      
      // 确定支持的 MIME 类型
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      // 创建 MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });
      mediaRecorderRef.current = mediaRecorder;
      
      // 收集音频数据
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      // 开始录制
      mediaRecorder.start(100); // 每 100ms 收集一次数据
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setDuration(0);
      
      // 启动计时器
      durationIntervalRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      
    } catch (recordingError) {
      const errorMsg = recordingError instanceof Error 
        ? recordingError.message 
        : '无法启动音频录制';
      
      if (errorMsg.includes('Permission') || errorMsg.includes('NotAllowed')) {
        setError('麦克风权限被拒绝，请使用浏览器识别或调试输入');
      } else {
        setError(`音频录制启动失败: ${errorMsg}`);
      }
      
      setIsRecording(false);
    }
  }, [isRecording, isSupported]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!isRecording || !mediaRecorderRef.current) {
      return null;
    }
    
    try {
      // 停止计时器
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      // 媒体录制器停止
      const mediaRecorder = mediaRecorderRef.current;
      
      // 等待录制停止和数据收集完成
      const audioBlob = await new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
          try {
            const chunks = audioChunksRef.current;
            if (chunks.length === 0) {
              reject(new Error('未录制到任何音频数据'));
              return;
            }
            
            // 确定 MIME 类型
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            const blob = new Blob(chunks, { type: mimeType });
            resolve(blob);
          } catch (error) {
            reject(error);
          }
        };
        
        mediaRecorder.onerror = (event) => {
          reject(new Error(`录制错误: ${event}`));
        };
        
        mediaRecorder.stop();
      });
      
      // 停止麦克风流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsRecording(false);
      mediaRecorderRef.current = null;
      
      return audioBlob;
      
    } catch (stopError) {
      const errorMsg = stopError instanceof Error 
        ? stopError.message 
        : '停止录制失败';
      
      setError(`停止录制失败: ${errorMsg}`);
      setIsRecording(false);
      
      // 清理资源
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      mediaRecorderRef.current = null;
      
      return null;
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (!isRecording) {
      return;
    }
    
    // 停止计时器
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    // 停止媒体录制器
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // 忽略停止错误
      }
      mediaRecorderRef.current = null;
    }
    
    // 停止麦克风流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // 清空音频数据
    audioChunksRef.current = [];
    
    setIsRecording(false);
    setDuration(0);
    setError(undefined);
  }, [isRecording]);

  return {
    isRecording,
    isSupported,
    duration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
