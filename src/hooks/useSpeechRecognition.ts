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
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    const win = window as WindowWithSpeechRecognition;
    setIsSupported(!!win.webkitSpeechRecognition || !!win.SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      onError?.('浏览器不支持语音识别');
      return;
    }

    const win = window as WindowWithSpeechRecognition;
    const SpeechRecognition = win.webkitSpeechRecognition || win.SpeechRecognition;
    
    if (!SpeechRecognition) {
      onError?.('浏览器不支持语音识别');
      return;
    }

    // Abort previous instance if exists
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
      onStart?.();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      const errorMsg = event.error === 'not-allowed' ? '请允许麦克风权限' : event.error;
      onError?.(errorMsg);
      recognition.abort();
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd?.(finalTranscriptRef.current);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onResult, onStart, onEnd, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    onEnd?.(finalTranscriptRef.current);
  }, [onEnd]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}