import { CanvasBoard } from './components/CanvasBoard';
import { VoicePanel } from './components/VoicePanel';
import { CommandLog } from './components/CommandLog';
import { ExampleCommands } from './components/ExampleCommands';
import { Toolbar } from './components/Toolbar';
import { ReplayPanel } from './components/ReplayPanel';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="title">SpeakSketch</h1>
        <p className="subtitle">纯语音结构化绘图工具</p>
      </header>
      
      <main className="main-content">
        <div className="canvas-section">
          <Toolbar />
          <CanvasBoard />
        </div>
        
        <aside className="sidebar">
          <VoicePanel />
          <ExampleCommands />
          <CommandLog />
          <ReplayPanel />
        </aside>
      </main>
    </div>
  );
}

export default App;
