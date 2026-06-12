import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { commandExecutor } from '../core/commandExecutor';
import { historyManager } from '../core/historyManager';

export function ReplayPanel() {
  const { commandHistory } = useAppStore();
  const { speak } = useSpeechSynthesis();
  const [isReplaying, setIsReplaying] = useState(false);

  const handleReplay = async () => {
    if (isReplaying || commandHistory.length === 0) return;
    
    setIsReplaying(true);
    
    // Clear canvas before replay
    historyManager.clear();
    
    speak('开始重放创作过程');
    
    for (let i = 0; i < commandHistory.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Only execute, don't add to commandHistory (avoid duplication)
      commandExecutor.execute(commandHistory[i]);
    }
    
    speak('创作过程重放完成');
    setIsReplaying(false);
  };

  const handleReplaySingle = (command: typeof commandHistory[0]) => {
    // Only execute, don't add to commandHistory
    commandExecutor.execute(command);
    speak('已完成');
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