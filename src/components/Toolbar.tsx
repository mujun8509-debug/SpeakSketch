import { useAppStore } from '../store/useAppStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { parse } from '../core/localParser';
import { commandExecutor } from '../core/commandExecutor';
import { historyManager } from '../core/historyManager';

export function Toolbar() {
  const { addLog, updateLog, addCommand } = useAppStore();
  const { speak } = useSpeechSynthesis();

  const handleAction = (action: string) => {
    const startTime = Date.now();
    const logId = addLog({ commandId: '', rawText: action, status: 'executing' });
    
    if (action === '撤销') {
      if (!historyManager.canUndo()) {
        updateLog(logId, {
          status: 'error',
          error: '没有可撤销的操作',
          executionTime: Date.now() - startTime
        });
        speak('没有可撤销的操作');
        return;
      }
    } else if (action === '重做') {
      if (!historyManager.canRedo()) {
        updateLog(logId, {
          status: 'error',
          error: '没有可重做的操作',
          executionTime: Date.now() - startTime
        });
        speak('没有可重做的操作');
        return;
      }
    } else if (action === '导出图片') {
      const canvas = commandExecutor.getCanvas();
      if (!canvas || canvas.getObjects().length === 0) {
        updateLog(logId, {
          status: 'error',
          error: '请先完成绘图后再导出',
          executionTime: Date.now() - startTime
        });
        speak('请先完成绘图后再导出');
        return;
      }
    }
    
    const command = parse(action);
    
    if (command.actions.length === 0) {
      updateLog(logId, {
        commandId: command.id,
        status: 'error',
        error: '无法识别的指令',
        executionTime: Date.now() - startTime
      });
      speak('无法识别的指令');
      return;
    }
    
    addCommand(command);
    
    const success = commandExecutor.execute(command);
    const execTime = Date.now() - startTime;
    
    if (success) {
      updateLog(logId, {
        commandId: command.id,
        status: 'success',
        actionTypes: command.actions.map(a => a.type),
        actionCount: command.actions.length,
        executionTime: execTime
      });
      speak(action === '清空画布' ? '画布已清空' : action === '撤销' ? '已撤销' : action === '重做' ? '已重做' : '已完成');
    } else {
      updateLog(logId, {
        commandId: command.id,
        status: 'error',
        error: '执行失败',
        executionTime: execTime
      });
      speak('执行失败');
    }
  };

  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={() => handleAction('撤销')} title="撤销">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </button>
      <button className="toolbar-button" onClick={() => handleAction('重做')} title="重做">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 11" />
        </svg>
      </button>
      <button className="toolbar-button" onClick={() => handleAction('清空画布')} title="清空画布">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}
