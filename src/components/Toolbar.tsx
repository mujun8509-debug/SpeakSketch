import { useAppStore } from '../store/useAppStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { parse } from '../core/localParser';
import { commandExecutor } from '../core/commandExecutor';

export function Toolbar() {
  const { addLog, addCommand } = useAppStore();
  const { speak } = useSpeechSynthesis();

  const handleAction = (action: string) => {
    addLog({ commandId: '', rawText: action, status: 'executing' });
    
    const command = parse(action);
    
    if (command.actions.length === 0) {
      addLog({ commandId: command.id, rawText: action, status: 'error', error: '无法识别的指令' });
      speak('无法识别的指令');
      return;
    }
    
    addCommand(command);
    
    const success = commandExecutor.execute(command);
    
    if (success) {
      addLog({ commandId: command.id, rawText: action, status: 'success' });
      speak(action === '清空画布' ? '画布已清空' : action === '撤销' ? '已撤销' : '已重做');
    } else {
      addLog({ commandId: command.id, rawText: action, status: 'error', error: '执行失败' });
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
