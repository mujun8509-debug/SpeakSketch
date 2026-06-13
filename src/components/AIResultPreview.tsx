import { useState } from 'react';
import { downloadDataUrl, downloadImage } from '../core/imageGenerationService';

export interface AIResultData {
  originalImageUrl: string;
  styledImageUrl?: string;
  styledImageDataUrl?: string;
  isMock: boolean;
  style: string;
  mood: string;
  error?: string;
}

interface AIResultPreviewProps {
  result?: AIResultData | null;
  onClose?: () => void;
}

export function AIResultPreview({ result, onClose }: AIResultPreviewProps) {
  const [activeTab, setActiveTab] = useState<'original' | 'styled'>('styled');

  if (!result) {
    return null;
  }

  const handleDownload = () => {
    // 优先下载 styled 版本
    if (result.styledImageUrl) {
      downloadImage(result.styledImageUrl, `speaksketch-${result.style}-${result.mood}.png`);
    } else if (result.styledImageDataUrl) {
      downloadDataUrl(result.styledImageDataUrl, `speaksketch-${result.style}-${result.mood}.png`);
    } else if (result.originalImageUrl) {
      downloadDataUrl(result.originalImageUrl, 'speaksketch-original.png');
    }
  };

  return (
    <div className="ai-result-preview">
      <div className="ai-result-header">
        <h3 className="ai-result-title">AI 风格化结果</h3>
        <button className="ai-result-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* 风格信息 */}
      <div className="ai-result-info">
        <span className="ai-result-tag">{result.style}</span>
        <span className="ai-result-tag">{result.mood}</span>
        {result.isMock && (
          <span className="ai-result-mock">Mock 模式</span>
        )}
        {result.error && (
          <span className="ai-result-error">生成失败</span>
        )}
      </div>

      {/* Tab 切换 */}
      <div className="ai-result-tabs">
        <button
          className={`ai-result-tab ${activeTab === 'original' ? 'active' : ''}`}
          onClick={() => setActiveTab('original')}
        >
          原始草图
        </button>
        <button
          className={`ai-result-tab ${activeTab === 'styled' ? 'active' : ''}`}
          onClick={() => setActiveTab('styled')}
          disabled={!result.styledImageUrl && !result.styledImageDataUrl && !result.error}
        >
          风格化结果
        </button>
      </div>

      {/* 图像预览 */}
      <div className="ai-result-image">
        {activeTab === 'original' ? (
          result.originalImageUrl ? (
            <img src={result.originalImageUrl} alt="原始草图" />
          ) : (
            <div className="ai-result-empty">暂无原始图像</div>
          )
        ) : result.error ? (
          <div className="ai-result-error-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>生成失败</p>
            <p className="ai-result-error-msg">{result.error}</p>
          </div>
        ) : result.styledImageUrl ? (
          <img src={result.styledImageUrl} alt="风格化结果" />
        ) : result.styledImageDataUrl ? (
          <img src={result.styledImageDataUrl} alt="风格化结果" />
        ) : result.isMock && result.originalImageUrl ? (
          <div className="ai-result-mock-content">
            <img src={result.originalImageUrl} alt="Mock 模式 - 原始图像" />
            <div className="ai-result-mock-overlay">
              <span>Mock 模式</span>
              <p>未调用真实 AI 模型</p>
              <p>显示原始画布</p>
            </div>
          </div>
        ) : (
          <div className="ai-result-empty">暂无风格化结果</div>
        )}
      </div>

      {/* 下载按钮 */}
      <div className="ai-result-actions">
        <button 
          className="ai-download-button"
          onClick={handleDownload}
          disabled={!result.styledImageUrl && !result.styledImageDataUrl && !result.originalImageUrl}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          下载结果
        </button>
      </div>

      {/* 说明 */}
      <div className="ai-result-note">
        <p>原始画布仍然保留在左侧，您可以继续编辑、撤销、重做和重放。</p>
        <p>AI 风格化是后处理增强，不会影响您的原始创作。</p>
      </div>
    </div>
  );
}