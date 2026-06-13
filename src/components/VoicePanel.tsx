import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { parseBilingualCommand } from '../core/bilingualParser';
import { commandExecutor } from '../core/commandExecutor';
import {
  getASRStatus,
  transcribeAudio,
  recordASRResult,
} from '../core/asrService';

export function VoicePanel() {
  const { transcript, setTranscript, isListening, setIsListening, addLog, updateLog, addCommand } = useAppStore();
  const [debugInput, setDebugInput] = useState('');
  const [error, setError] = useState('');
  const [asrMode, setAsrMode] = useState<'browser' | 'cloud'>('browser');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use ref to avoid React state async issue
  const latestTranscriptRef = useRef<string>('');
  
  const { speak } = useSpeechSynthesis();
  const audioRecorder = useAudioRecorder();

  // 加载 ASR 状态
  useEffect(() => {
    const status = getASRStatus();
    // 根据配置状态设置默认模式
    if (status.currentProvider === 'xunfei' && status.isConfigured) {
      setAsrMode('cloud');
    } else if (status.currentProvider === 'browser') {
      setAsrMode('browser');
    } else {
      // auto 模式：优先浏览器
      setAsrMode('browser');
    }
  }, []);

  // 浏览器识别回调
  const handleResult = (text: string, _isFinal: boolean) => {
    latestTranscriptRef.current = text;
    setTranscript(text);
  };

  const handleStart = () => {
    setIsListening(true);
    setError('');
    latestTranscriptRef.current = '';
  };

  const handleEnd = (finalTranscript: string) => {
    setIsListening(false);
    const textToExecute = finalTranscript || latestTranscriptRef.current;
    if (textToExecute.trim()) {
      // 记录浏览器识别结果
      recordASRResult({
        text: textToExecute.trim(),
        provider: 'browser',
        language: 'zh',
      });
      executeCommand(textToExecute.trim());
    }
    latestTranscriptRef.current = '';
    setTranscript('');
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setIsListening(false);
  };

  const { startListening, isSupported } = useSpeechRecognition({
    onResult: handleResult,
    onStart: handleStart,
    onEnd: handleEnd,
    onError: handleError,
  });

  // 云端识别流程
  const handleCloudRecording = async () => {
    if (audioRecorder.isRecording) {
      // 停止录音并识别
      setIsProcessing(true);
      setError('');
      
      try {
        const audioBlob = await audioRecorder.stopRecording();
        
        if (!audioBlob) {
          setError('录音失败，请重试');
          speak('录音失败，请重试');
          setIsProcessing(false);
          return;
        }
        
        // 获取当前 ASR 状态
        const asrStatus = getASRStatus();
        
        // 调用云端识别
        const result = await transcribeAudio({
          audioBlob,
          languageMode: asrStatus.currentLanguageMode,
          provider: asrStatus.currentProvider,
        });
        
        if (result.error) {
          setError(result.error);
          speak('语音识别失败，请重试或使用调试输入');
          setIsProcessing(false);
          return;
        }
        
        if (result.text.trim()) {
          // 记录识别结果
          recordASRResult(result);
          speak(`识别成功：${result.text}`);
          executeCommand(result.text.trim());
        } else {
          setError('未识别到语音内容');
          speak('未识别到语音内容，请重试');
        }
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '识别过程出错';
        setError(`语音识别失败: ${errorMsg}`);
        speak('语音识别失败，请重试或使用调试输入');
      } finally {
        setIsProcessing(false);
      }
      
    } else {
      // 开始录音
      audioRecorder.startRecording();
    }
  };

  const executeCommand = (text: string) => {
    const startTime = Date.now();
    
    const logId = addLog({ commandId: '', rawText: text, status: 'executing' });
    
    try {
      const { command, language } = parseBilingualCommand(text);
      
      if (!command || command.actions.length === 0) {
        const execTime = Date.now() - startTime;
        updateLog(logId, {
          commandId: command?.id || '',
          status: 'error',
          error: '我没有理解这条指令，请换一种说法',
          actionCount: 0,
          executionTime: execTime,
          language
        });
        speak('我没有理解这条指令，请换一种说法');
        return;
      }
      
      addCommand(command);
      
      const actionTypes = command.actions.map(a => a.type);
      
      const success = commandExecutor.execute(command);
      
      const execTime = Date.now() - startTime;
      
      if (success) {
        updateLog(logId, {
          commandId: command.id,
          status: 'success',
          actionTypes,
          actionCount: command.actions.length,
          executionTime: execTime,
          relationType: (command as any).relationType,
          language
        });
        speak(`已完成：${text}`);
      } else {
        updateLog(logId, {
          commandId: command.id,
          status: 'error',
          error: '执行失败，请检查指令格式',
          actionTypes,
          actionCount: command.actions.length,
          executionTime: execTime,
          relationType: (command as any).relationType,
          language
        });
        speak('执行失败，请检查指令格式');
      }
    } catch (err) {
      const execTime = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : '执行异常';
      updateLog(logId, {
        commandId: '',
        status: 'error',
        error: `执行异常: ${errorMsg}`,
        actionCount: 0,
        executionTime: execTime,
        language: 'unknown'
      });
      speak('执行过程中出现异常');
    }
  };

  const handleExecute = () => {
    if (debugInput.trim()) {
      executeCommand(debugInput.trim());
      setDebugInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleExecute();
    }
  };

  // 切换识别模式
  const handleModeSwitch = (mode: 'browser' | 'cloud') => {
    setAsrMode(mode);
    setError('');
    
    // 如果正在录音，取消当前录音
    if (audioRecorder.isRecording) {
      audioRecorder.cancelRecording();
    }
  };

  const asrStatus = getASRStatus();

  return (
    <div className="voice-panel">
      <div className="section">
        <h3 className="section-title">语音控制</h3>
        
        {/* 识别模式切换 */}
        <div className="asr-mode-switch">
          <button
            className={`mode-button ${asrMode === 'browser' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('browser')}
            disabled={isListening || audioRecorder.isRecording || isProcessing}
          >
            浏览器识别
          </button>
          <button
            className={`mode-button ${asrMode === 'cloud' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('cloud')}
            disabled={!asrStatus.isConfigured || isListening || audioRecorder.isRecording || isProcessing}
          >
            云端识别
            {!asrStatus.isConfigured && <span className="mode-warning">（未配置）</span>}
          </button>
        </div>
        
        {/* 浏览器识别按钮 */}
        {asrMode === 'browser' && (
          <button
            className={`mic-button ${isListening ? 'active' : ''}`}
            onClick={startListening}
            disabled={isListening || !isSupported}
          >
            <svg className="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>{isListening ? '正在听...' : '开始语音'}</span>
          </button>
        )}
        
        {/* 云端识别按钮 */}
        {asrMode === 'cloud' && (
          <button
            className={`mic-button ${audioRecorder.isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
            onClick={handleCloudRecording}
            disabled={!audioRecorder.isSupported || isProcessing}
          >
            <svg className="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>
              {isProcessing ? '识别中...' : 
               audioRecorder.isRecording ? `录音中 (${audioRecorder.duration}s)` : 
               '开始录音'}
            </span>
          </button>
        )}
        
        {/* 错误提示 */}
        {!isSupported && asrMode === 'browser' && (
          <p className="warning">浏览器不支持语音识别</p>
        )}
        {!audioRecorder.isSupported && asrMode === 'cloud' && (
          <p className="warning">{audioRecorder.error || '浏览器不支持音频录制'}</p>
        )}
        {error && (
          <p className="error">{error}</p>
        )}
      </div>

      {/* 当前识别内容 */}
      {transcript && asrMode === 'browser' && (
        <div className="section">
          <h3 className="section-title">当前识别</h3>
          <div className="transcript-box">
            <p>{transcript}</p>
          </div>
        </div>
      )}

      {/* 调试输入 - 始终保留 */}
      <div className="section">
        <h3 className="section-title">调试输入</h3>
        <div className="debug-input-group">
          <input
            type="text"
            className="debug-input"
            value={debugInput}
            onChange={(e) => setDebugInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入绘图指令..."
            disabled={isListening || audioRecorder.isRecording || isProcessing}
          />
          <button 
            className="execute-button" 
            onClick={handleExecute}
            disabled={isListening || audioRecorder.isRecording || isProcessing}
          >
            执行
          </button>
        </div>
      </div>
    </div>
  );
}