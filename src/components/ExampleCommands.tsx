import { useAppStore } from '../store/useAppStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { parseBilingualCommand } from '../core/bilingualParser';
import { commandExecutor } from '../core/commandExecutor';

// 按用户要求分组
const commandGroups = [
  {
    title: '基础绘图',
    commands: [
      '画一个红色圆形',
      '在左上角画一个蓝色矩形',
      '写上"人工智能绘图"',
    ]
  },
  {
    title: '复杂对象',
    commands: [
      '画一个男人',
      '画一只猫',
      '画一辆红色汽车',
      '画一朵黄色的花',
    ]
  },
  {
    title: '复杂场景',
    commands: [
      '画一个公园，有人、树、花、草地和小鸟',
      '画一个海边，有太阳、云、船、海平线和飞鸟',
      '画一个校园，有教学楼、树、草地和学生',
    ]
  },
  {
    title: '空间关系',
    commands: [
      '画一个男人站在树旁边',
      '画一只猫在汽车旁边',
      '画一艘船在河上',
      '画几只鸟在天空中',
      '画一只鸟在树的上方',
      '画一辆车在房子的左边',
      '画一只狗在男人的右边',
      '画一只鸟飞向东方',
      '画一辆车开到北边',
      '画一只鸟在远处',
      '画一朵花在近处',
    ]
  },
  {
    title: '编辑操作',
    commands: [
      '把刚才那个图形改成蓝色',
      '把最大的图形放大一点',
      '删除最左边的图形',
      '撤销',
      '重做',
      '清空画布',
      '导出图片',
      '重放全部',
    ]
  },
  {
    title: 'English Commands',
    commands: [
      'draw a red circle',
      'draw a blue rectangle',
      'add text "AI drawing"',
      'draw a man',
      'draw a cat',
      'draw a red car',
      'draw birds in the sky',
      'change the last shape to blue',
      'make the biggest shape bigger',
      'delete the leftmost shape',
      'undo',
      'redo',
      'clear the canvas',
      'export image',
      'replay all',
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
      {commandGroups.map((group) => (
        <div key={group.title} className="example-group">
          <h3 className="section-title">{group.title}</h3>
          <div className="example-list">
            {group.commands.map((text) => (
              <button
                key={text}
                className="example-button"
                onClick={() => handleClick(text)}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}