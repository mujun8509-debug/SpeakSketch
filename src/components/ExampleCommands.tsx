import { useAppStore } from '../store/useAppStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { parseBilingualCommand } from '../core/bilingualParser';
import { commandExecutor } from '../core/commandExecutor';

// 按用户要求重新设计的命令分组
const commandGroups = [
  {
    title: '基础绘图',
    commands: [
      '画一个红色圆形',
      '画一个蓝色矩形',
      '画一条直线',
      '写上"AI绘图"',
    ]
  },
  {
    title: '复杂对象',
    commands: [
      '画一只猫',
      '画一个人',
      '画一辆汽车',
      '画一棵树',
      '画一朵花',
      '画一只狗',
    ]
  },
  {
    title: '复杂场景',
    commands: [
      '画一个公园',
      '画一个海边',
      '画一个校园',
    ]
  },
  {
    title: '位置指令',
    commands: [
      '右下角画一只猫',
      '左上角画圆形',
      '中间画蓝色矩形',
      '右边画一棵树',
    ]
  },
  {
    title: '空间关系',
    commands: [
      '男人站在树旁边',
      '猫在汽车旁边',
      '鸟在天空中',
      '船在河上',
    ]
  },
  {
    title: '编辑操作',
    commands: [
      '撤销',
      '重做',
      '清空画布',
      '重放全部',
      '导出图片',
    ]
  },
];

export function ExampleCommands() {
  const { addLog, updateLog, addCommand } = useAppStore();
  const { speak } = useSpeechSynthesis();

  const handleClick = (text: string) => {
    const startTime = Date.now();

    const logId = addLog({ commandId: '', rawText: text, status: 'executing' });

    try {
      const { command, language } = parseBilingualCommand(text);

      if (!command || command.actions.length === 0) {
        const execTime = Date.now() - startTime;
        updateLog(logId, {
          commandId: command?.id || '',
          status: 'error',
          error: '暂不支持该指令，请尝试其他示例',
          actionCount: 0,
          executionTime: execTime,
          language
        });
        speak('暂不支持该指令，请尝试其他示例');
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
        speak('执行失败');
      }
    } catch (error) {
      const execTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      updateLog(logId, {
        commandId: '',
        status: 'error',
        error: `执行异常: ${errorMsg}`,
        actionCount: 0,
        executionTime: execTime,
        language: 'unknown'
      });
      speak('执行过程中出现异常');
      console.error('示例指令执行错误:', error);
    }
  };

  return (
    <div className="example-commands panel-card">
      <h3 className="section-title">示例指令</h3>
      <div className="example-panel">
        {commandGroups.map((group) => (
          <div key={group.title} className="command-group">
            <h4 className="command-group-title">{group.title}</h4>
            <div className="command-chip-list">
              {group.commands.map((text) => (
                <button
                  key={text}
                  className="command-chip"
                  onClick={() => handleClick(text)}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}