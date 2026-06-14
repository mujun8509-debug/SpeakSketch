import { useState, useEffect } from 'react';
import { commandExecutor } from '../core/commandExecutor';
import { generateStyledImage, getImageGenerationConfig } from '../core/imageGenerationService';
import { buildStylePrompt, getAvailableStyles, getAvailableMoods } from '../core/stylePromptBuilder';

export interface AIResult {
  originalImageUrl: string;
  styledImageUrl?: string;
  styledImageDataUrl?: string;
  isMock: boolean;
  style: string;
  mood: string;
  error?: string;
}

interface AIStylePanelProps {
  onGenerationComplete?: (result: AIResult) => void;
}

export function AIStylePanel({ onGenerationComplete }: AIStylePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);

  const styles = getAvailableStyles();
  const moods = getAvailableMoods();

  useEffect(() => {
    const config = getImageGenerationConfig();
    setIsConfigured(config.isConfigured);
  }, []);

  const handleGenerate = async () => {
    // 验证选择
    if (!selectedStyle) {
      setError('请选择一种风格');
      return;
    }
    if (!selectedMood) {
      setError('请选择一种氛围');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      // 获取当前画布内容
      const canvas = commandExecutor.getCanvas();
      if (!canvas) {
        setError('画布未初始化');
        setIsGenerating(false);
        return;
      }

      const objects = canvas.getObjects();
      if (objects.length === 0) {
        setError('请先在画布上绘制内容后再生成风格化成品');
        setIsGenerating(false);
        return;
      }

      // 导出当前画布为 Data URL
      const imageDataUrl = canvas.toDataURL({
        multiplier: 1,
        format: 'png',
        quality: 1,
      });

      // 生成提示词
      const prompt = buildStylePrompt({
        style: selectedStyle,
        mood: selectedMood,
      });

      // 调用图像生成服务
      const result = await generateStyledImage({
        imageDataUrl,
        style: selectedStyle,
        mood: selectedMood,
        prompt,
      });

      if (result.error) {
        setError(result.error);
        onGenerationComplete?.({
          originalImageUrl: imageDataUrl,
          isMock: false,
          style: selectedStyle,
          mood: selectedMood,
          error: result.error,
        });
      } else {
        onGenerationComplete?.({
          originalImageUrl: imageDataUrl,
          styledImageUrl: result.imageUrl,
          styledImageDataUrl: result.imageDataUrl,
          isMock: result.isMock,
          style: selectedStyle,
          mood: selectedMood,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '生成失败';
      setError(errorMsg);
      onGenerationComplete?.({
        originalImageUrl: '',
        isMock: false,
        style: selectedStyle,
        mood: selectedMood,
        error: errorMsg,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="ai-style-panel panel-card">
      <button 
        className="ai-style-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>AI 风格化</span>
      </button>

      {isOpen && (
        <div className="ai-style-content">
          {/* 说明文案 */}
          <div className="ai-style-intro">
            <p>AI 风格化不会替代结构化绘图。它会在您完成语音绘图后，将当前可编辑画布转化为动漫化、电影化、赛博朋克等成品风格。</p>
            <p className="ai-style-note">原画布仍然保留，可继续编辑、撤销、重做和重放。</p>
          </div>

          {/* Mock 模式提示 */}
          {!isConfigured && (
            <div className="ai-style-mock-notice">
              <span className="mock-badge">Mock 模式</span>
              <span>未配置 VITE_IMAGE_API_URL，将使用原始画布作为结果</span>
            </div>
          )}

          {/* 风格选择 */}
          <div className="ai-style-group">
            <label className="ai-style-label">选择风格</label>
            <div className="ai-style-options">
              {styles.map((style) => (
                <button
                  key={style}
                  className={`ai-style-option ${selectedStyle === style ? 'active' : ''}`}
                  onClick={() => setSelectedStyle(style)}
                  disabled={isGenerating}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* 氛围选择 */}
          <div className="ai-style-group">
            <label className="ai-style-label">选择氛围</label>
            <div className="ai-mood-options">
              {moods.map((mood) => (
                <button
                  key={mood}
                  className={`ai-mood-option ${selectedMood === mood ? 'active' : ''}`}
                  onClick={() => setSelectedMood(mood)}
                  disabled={isGenerating}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            className="ai-generate-button"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedStyle || !selectedMood}
          >
            {isGenerating ? (
              <>
                <span className="ai-spinner"></span>
                生成中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                生成 AI 风格化成品
              </>
            )}
          </button>

          {/* 错误提示 */}
          {error && (
            <div className="ai-style-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}