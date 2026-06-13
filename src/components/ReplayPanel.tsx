import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { commandExecutor } from '../core/commandExecutor';
import { historyManager } from '../core/historyManager';

export function ReplayPanel() {
  const { commandHistory, addLog, updateLog } = useAppStore();
  const { speak } = useSpeechSynthesis();
  const [isReplaying, setIsReplaying] = useState(false);

  const handleReplay = async () => {
    if (isReplaying) {
      speak('正在重放中，请稍候');
      return;
    }
    
    if (commandHistory.length === 0) {
      speak('没有可重放的历史记录');
      return;
    }
    
    const startTime = Date.now();
    const logId = addLog({ commandId: '', rawText: '重放全部', status: 'executing' });
    
    setIsReplaying(true);
    
    try {
      speak('正在清空画布并开始重放');
      historyManager.clear();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      for (let i = 0; i < commandHistory.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        commandExecutor.execute(commandHistory[i]);
      }
      
      const execTime = Date.now() - startTime;
      updateLog(logId, {
        status: 'success',
        actionCount: commandHistory.length,
        executionTime: execTime
      });
      speak('创作过程重放完成');
    } catch (error) {
      const execTime = Date.now() - startTime;
      updateLog(logId, {
        status: 'error',
        error: '重放过程中出现错误',
        executionTime: execTime
      });
      speak('重放过程中出现错误');
    } finally {
      setIsReplaying(false);
    }
  };

  const handleReplaySingle = (command: typeof commandHistory[0]) => {
    if (isReplaying) {
      speak('正在重放中，请稍候');
      return;
    }
    try {
      commandExecutor.execute(command);
      speak('已完成');
    } catch (error) {
      speak('执行失败');
    }
  };

  return (
    <div className="replay-panel">
      <h3 className="section-title">历史指令</h3>
      <div className="history-list">
        {commandHistory.length === 0 ? (
          <p className="empty">暂无历史指令</p>
        ) : (
          <>
            {commandHistory.map((command) => (
              <button
                key={command.id}
                className="history-item"
                onClick={() => handleReplaySingle(command)}
                disabled={isReplaying}
              >
                <span>{command.rawText}</span>
              </button>
            ))}
            <button
              className={`replay-all-button ${isReplaying ? 'active' : ''}`}
              onClick={handleReplay}
              disabled={isReplaying}
            >
              {isReplaying ? '重放中...' : '重放全部'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}