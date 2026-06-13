import { useState } from 'react';
import { CanvasBoard } from './components/CanvasBoard';
import { VoicePanel } from './components/VoicePanel';
import { CommandLog } from './components/CommandLog';
import { ExampleCommands } from './components/ExampleCommands';
import { Toolbar } from './components/Toolbar';
import { ReplayPanel } from './components/ReplayPanel';
import { AIStylePanel } from './components/AIStylePanel';
import { AIResultPreview, AIResultData } from './components/AIResultPreview';
import { ASRSettingsPanel } from './components/ASRSettingsPanel';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { parse } from './core/localParser';
import { commandExecutor } from './core/commandExecutor';
import { useAppStore } from './store/useAppStore';

// Demo 模式指令序列
const DEMO_COMMANDS = [
  '清空画布',
  '画一个海边，有太阳、云、船、海平线和飞鸟',
  '画一个男人站在树旁边',
  '画一只猫在汽车旁边',
  '画几只鸟在天空中',
  '把刚才那个图形改成蓝色',
  '把最大的图形放大一点',
];

function App() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [aiResult, setAiResult] = useState<AIResultData | null>(null);
  const { speak } = useSpeechSynthesis();
  const { addLog, updateLog, addCommand } = useAppStore();

  // Demo 模式执行
  const runDemoMode = async () => {
    if (isDemoMode) {
      speak('演示正在进行中，请稍候');
      return;
    }
    setIsDemoMode(true);

    try {
      speak('开始演示，请稍候');
      
      for (const text of DEMO_COMMANDS) {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const startTime = Date.now();
        const logId = addLog({ commandId: '', rawText: text, status: 'executing' });
        
        try {
          const command = parse(text);
          if (command.actions.length > 0) {
            addCommand(command);
            const actionTypes = command.actions.map(a => a.type);
            const success = commandExecutor.execute(command);
            const execTime = Date.now() - startTime;
            
            updateLog(logId, {
              commandId: command.id,
              status: success ? 'success' : 'error',
              actionTypes,
              actionCount: command.actions.length,
              executionTime: execTime,
              relationType: (command as any).relationType,
              error: success ? undefined : '执行失败'
            });
          } else {
            updateLog(logId, {
              status: 'error',
              error: '无法解析指令',
              executionTime: Date.now() - startTime
            });
          }
        } catch (error) {
          updateLog(logId, {
            status: 'error',
            error: '执行过程中出现错误',
            executionTime: Date.now() - startTime
          });
        }
      }

      speak('演示完成');
    } catch (error) {
      speak('演示过程中出现错误');
    } finally {
      setIsDemoMode(false);
    }
  };

  // AI 生成完成回调
  const handleGenerationComplete = (result: AIResultData) => {
    setAiResult(result);
    if (result.error) {
      speak('风格化生成失败');
    } else if (result.isMock) {
      speak('Mock 模式：使用原始画布作为结果');
    } else {
      speak('风格化成品已生成');
    }
  };

  return (
    <div className="app">
      {/* 顶部标题区域 */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">SpeakSketch</h1>
          <p className="subtitle">纯语音结构化绘图工具</p>
          <p className="description">用语音创建、编辑、撤销和重放可编辑的结构化图形</p>
        </div>
        <button 
          className={`demo-button ${isDemoMode ? 'active' : ''}`}
          onClick={runDemoMode}
          disabled={isDemoMode}
        >
          {isDemoMode ? '演示中...' : '一键演示'}
        </button>
      </header>

      {/* 主体区域 */}
      <main className="main-content">
        {/* 左侧画布区域 */}
        <div className="canvas-section">
          <Toolbar />
          <CanvasBoard />
          
          {/* AI 风格化面板 */}
          <AIStylePanel onGenerationComplete={handleGenerationComplete} />
          
          {/* AI 结果预览 */}
          {aiResult && (
            <AIResultPreview 
              result={aiResult} 
              onClose={() => setAiResult(null)} 
            />
          )}
          
          {/* 项目亮点卡片 */}
          <div className="features-card">
            <h3 className="features-title">项目亮点</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">🎤</span>
                <span className="feature-text">纯语音控制</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🎨</span>
                <span className="feature-text">结构化绘图动作</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🧩</span>
                <span className="feature-text">复杂对象组合绘制</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📍</span>
                <span className="feature-text">空间关系模板解析</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">↩️</span>
                <span className="feature-text">可撤销、可重做、可重放</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span className="feature-text">AI 风格化成品</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧控制台区域 */}
        <aside className="sidebar">
          <ASRSettingsPanel />
          <VoicePanel />
          <ExampleCommands />
          <CommandLog />
          <ReplayPanel />
          
          {/* 能力说明区域 */}
          <div className="capability-card">
            <h3 className="capability-title">能力说明</h3>
            <div className="capability-section">
              <h4 className="capability-subtitle">已支持</h4>
              <ul className="capability-list supported">
                <li>语音识别与文本指令输入</li>
                <li>基础图形绘制（圆形、矩形、三角形等）</li>
                <li>复杂对象简笔画绘制（人物、猫、狗、汽车等）</li>
                <li>复杂场景模板绘制（公园、海边、校园）</li>
                <li>空间关系模板解析（旁边、左边，天空中等）</li>
                <li>图形编辑、撤销、重做、导出、重放</li>
                <li>AI 风格化成品生成</li>
              </ul>
            </div>
            <div className="capability-section">
              <h4 className="capability-subtitle">当前版本暂未接入</h4>
              <ul className="capability-list unsupported">
                <li>开放式抽象语义理解</li>
                <li>复杂遮挡和姿态推理</li>
                <li>自由手绘笔刷</li>
                <li>图层管理</li>
              </ul>
            </div>
          </div>
        </aside>
      </main>

      {/* 底部信息 */}
      <footer className="footer">
        <p>SpeakSketch - 纯语音结构化绘图工具</p>
        <p>技术栈: Vite + React + TypeScript + Fabric.js + Zustand</p>
      </footer>
    </div>
  );
}

export default App;