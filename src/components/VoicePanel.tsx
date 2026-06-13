import { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { parseBilingualCommand } from '../core/bilingualParser';
import { commandExecutor } from '../core/commandExecutor';

export function VoicePanel() {
  const { transcript, setTranscript, isListening, setIsListening, addLog, updateLog, addCommand } = useAppStore();
  const [debugInput, setDebugInput] = useState('');
  const [error, setError] = useState('');
  
  // Use ref to avoid React state async issue
  const latestTranscriptRef = useRef<string>('');
  
  const { speak } = useSpeechSynthesis();

  const handleResult = (text: string, _isFinal: boolean) => {
    // Update both ref and state
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
    // Use ref instead of state to avoid async issue
    const textToExecute = finalTranscript || latestTranscriptRef.current;
    if (textToExecute.trim()) {
      executeCommand(textToExecute.trim());
    }
    // Clear both ref and state
    latestTranscriptRef.current = '';
    setTranscript('');
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setIsListening(false);
  };

  const { startListening, isSupported, error: speechError } = useSpeechRecognition({
    onResult: handleResult,
    onStart: handleStart,
    onEnd: handleEnd,
    onError: handleError,
  });

  const executeCommand = (text: string) => {
    const startTime = Date.now();
    
    const logId = addLog({ commandId: '', rawText: text, status: 'executing' });
    
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

  return (
    <div className="voice-panel">
      <div className="section">
        <h3 className="section-title">语音控制</h3>
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
        {!isSupported && speechError && (
          <p className="warning">{speechError}</p>
        )}
        {error && (
          <p className="error">{error}</p>
        )}
      </div>

      {transcript && (
        <div className="section">
          <h3 className="section-title">当前识别</h3>
          <div className="transcript-box">
            <p>{transcript}</p>
          </div>
        </div>
      )}

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
          />
          <button className="execute-button" onClick={handleExecute}>
            执行
          </button>
        </div>
      </div>
    </div>
  );
}