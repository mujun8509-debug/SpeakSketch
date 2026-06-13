import { useEffect, useCallback, useState, useRef } from 'react';

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionResultItem;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface UseSpeechRecognitionProps {
  onResult: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: (finalTranscript: string) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart?: () => void;
  onresult?: (event: SpeechRecognitionEvent) => void;
  onerror?: (event: SpeechRecognitionErrorEvent) => void;
  onend?: () => void;
  start: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = {
  new (): SpeechRecognitionInstance;
};

interface WindowWithSpeechRecognition extends Window {
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  SpeechRecognition?: SpeechRecognitionConstructor;
}

export function useSpeechRecognition({
  onResult,
  onStart,
  onEnd,
  onError,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const isStartingRef = useRef(false);

  useEffect(() => {
    try {
      const win = window as WindowWithSpeechRecognition;
      const hasRecognition = !!win.webkitSpeechRecognition || !!win.SpeechRecognition;
      setIsSupported(hasRecognition);
      if (!hasRecognition) {
        setError('浏览器不支持语音识别，您可以使用下方调试输入框输入指令');
      }
    } catch {
      setIsSupported(false);
      setError('无法检测语音识别支持，请使用调试输入框');
    }
  }, []);

  const startListening = useCallback(() => {
    if (isStartingRef.current) {
      return;
    }
    
    if (!isSupported) {
      const msg = '浏览器不支持语音识别，请使用下方调试输入框';
      setError(msg);
      onError?.(msg);
      return;
    }

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognition = win.webkitSpeechRecognition || win.SpeechRecognition;
    
    if (!SpeechRecognition) {
      const msg = '无法初始化语音识别，请使用下方调试输入框';
      setError(msg);
      onError?.(msg);
      return;
    }

    isStartingRef.current = true;
    setError('');

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      finalTranscriptRef.current = '';

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';

      recognition.onstart = () => {
        setIsListening(true);
        setError('');
        onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        try {
          let interimTranscript = '';
          let finalPart = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalPart += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalPart) {
            finalTranscriptRef.current = finalPart;
            onResult(finalPart, true);
          } else if (interimTranscript) {
            onResult(interimTranscript, false);
          }
        } catch (resultError) {
          console.error('语音识别结果处理错误:', resultError);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        isStartingRef.current = false;
        
        let errorMsg = '';
        switch (event.error) {
          case 'not-allowed':
            errorMsg = '请在浏览器设置中允许麦克风权限，或使用下方调试输入框输入指令';
            break;
          case 'no-speech':
            errorMsg = '未检测到语音输入，请尝试重新说话';
            break;
          case 'aborted':
            errorMsg = '语音识别已取消';
            break;
          case 'network':
            errorMsg = '网络连接异常，请检查网络或使用调试输入框';
            break;
          case 'service-not-allowed':
            errorMsg = '语音服务不可用，请使用调试输入框';
            break;
          default:
            errorMsg = `语音识别错误: ${event.error}`;
        }
        
        setError(errorMsg);
        onError?.(errorMsg);
        recognition.abort();
      };

      recognition.onend = () => {
        setIsListening(false);
        isStartingRef.current = false;
        onEnd?.(finalTranscriptRef.current);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (initError) {
      isStartingRef.current = false;
      const msg = '语音识别初始化失败，请使用调试输入框';
      setError(msg);
      onError?.(msg);
      console.error('语音识别初始化错误:', initError);
    }
  }, [isSupported, onResult, onStart, onEnd, onError]);

  const stopListening = useCallback(() => {
    isStartingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // 忽略中止错误
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    onEnd?.(finalTranscriptRef.current);
  }, [onEnd]);

  return {
    isListening,
    isSupported,
    isError: !!error,
    error,
    startListening,
    stopListening,
  };
}