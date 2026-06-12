import { useAppStore } from '../store/useAppStore';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { parse } from '../core/localParser';
import { commandExecutor } from '../core/commandExecutor';

const basicExamples = [
  { text: '画一个红色圆形', description: '绘制红色圆形' },
  { text: '画一个蓝色矩形', description: '绘制蓝色矩形' },
  { text: '画一个三角形', description: '绘制三角形' },
  { text: '画一个太阳', description: '绘制太阳（带光线）' },
  { text: '画三朵云', description: '绘制三朵云' },
  { text: '画一棵树', description: '绘制树' },
  { text: '写上"人工智能绘图"', description: '添加文本' },
  { text: '画一条直线', description: '绘制黑色直线' },
];

const positionExamples = [
  { text: '在左上角画红色圆形', description: '在指定位置绘制' },
  { text: '在中间写上"Hello"', description: '在中间添加文本' },
  { text: '在右下角画一棵树', description: '在右下角绘制树' },
];

const editExamples = [
  { text: '把刚才那个改成蓝色', description: '修改最近图形颜色' },
  { text: '把最大的图形放大', description: '放大最大的图形' },
  { text: '删除最左边的图形', description: '删除最左边图形' },
];

const complexObjectExamples = [
  { text: '画一个男人', description: '绘制人物' },
  { text: '画一只猫', description: '绘制猫' },
  { text: '画一只狗', description: '绘制狗' },
  { text: '画一辆红色汽车', description: '绘制红色汽车' },
  { text: '画一朵花', description: '绘制花朵' },
  { text: '画一座山', description: '绘制山' },
  { text: '画一条河', description: '绘制河流' },
  { text: '画一艘船', description: '绘制船' },
  { text: '画一片草地', description: '绘制草地' },
  { text: '画几只鸟', description: '绘制鸟' },
];

const sceneExamples = [
  { text: '画一个房子', description: '绘制房子' },
  { text: '画一个简单风景', description: '绘制完整风景' },
  { text: '画一个公园', description: '绘制公园场景' },
  { text: '画一个海边', description: '绘制海边场景' },
  { text: '画一个校园', description: '绘制校园场景' },
];

const relationExamples = [
  { text: '画一个男人站在树旁边', description: '人物与树的空间关系' },
  { text: '画一只猫在汽车旁边', description: '猫与汽车的空间关系' },
  { text: '画一艘船在河上', description: '船与河的空间关系' },
  { text: '画几只鸟在天空中', description: '鸟在天空的位置' },
  { text: '画一个学生站在教学楼旁边', description: '学生与教学楼的组合' },
  { text: '画一只狗在花旁边', description: '狗与花的空间关系' },
];

const systemExamples = [
  { text: '清空画布', description: '清除所有图形' },
  { text: '撤销', description: '撤销上一步操作' },
  { text: '重做', description: '恢复撤销的操作' },
];

export function ExampleCommands() {
  const { addLog, updateLog, addCommand } = useAppStore();
  const { speak } = useSpeechSynthesis();

  const handleClick = (text: string) => {
    const startTime = Date.now();
    
    // Add executing log and get its id
    const logId = addLog({ commandId: '', rawText: text, status: 'executing' });
    
    const command = parse(text);
    
    if (command.actions.length === 0) {
      const execTime = Date.now() - startTime;
      updateLog(logId, {
        commandId: command.id,
        status: 'error',
        error: '我没有理解这条指令，请换一种说法',
        actionCount: 0,
        executionTime: execTime
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
        relationType: (command as any).relationType
      });
      speak(`已完成：${text}`);
    } else {
      updateLog(logId, {
        commandId: command.id,
        status: 'error',
        error: '执行失败',
        actionTypes,
        actionCount: command.actions.length,
        executionTime: execTime,
        relationType: (command as any).relationType
      });
      speak('执行失败');
    }
  };

  return (
    <div className="example-commands">
      <h3 className="section-title">基础图形</h3>
      <div className="example-list">
        {basicExamples.map((example) => (
          <button
            key={example.text}
            className="example-button"
            onClick={() => handleClick(example.text)}
            title={example.description}
          >
            {example.text}
          </button>
        ))}
      </div>

      <h3 className="section-title">位置指令</h3>
      <div className="example-list">
        {positionExamples.map((example) => (
          <button
            key={example.text}
            className="example-button"
            onClick={() => handleClick(example.text)}
            title={example.description}
          >
            {example.text}
          </button>
        ))}
      </div>

      <h3 className="section-title">编辑指令</h3>
      <div className="example-list">
        {editExamples.map((example) => (
          <button
            key={example.text}
            className="example-button"
            onClick={() => handleClick(example.text)}
            title={example.description}
          >
            {example.text}
          </button>
        ))}
      </div>

      <h3 className="section-title">复杂对象</h3>
      <div className="example-list">
        {complexObjectExamples.map((example) => (
          <button
            key={example.text}
            className="example-button"
            onClick={() => handleClick(example.text)}
            title={example.description}
          >
            {example.text}
          </button>
        ))}
      </div>

      <h3 className="section-title">场景绘制</h3>
      <div className="example-list">
        {sceneExamples.map((example) => (
          <button
            key={example.text}
            className="example-button"
            onClick={() => handleClick(example.text)}
            title={example.description}
          >
            {example.text}
          </button>
        ))}
      </div>

      <h3 className="section-title">空间关系指令</h3>
      <div className="example-list">
        {relationExamples.map((example) => (
          <button
            key={example.text}
            className="example-button"
            onClick={() => handleClick(example.text)}
            title={example.description}
          >
            {example.text}
          </button>
        ))}
      </div>

      <h3 className="section-title">系统命令</h3>
      <div className="example-list">
        {systemExamples.map((example) => (
          <button
            key={example.text}
            className="example-button"
            onClick={() => handleClick(example.text)}
            title={example.description}
          >
            {example.text}
          </button>
        ))}
      </div>
    </div>
  );
}