import { useState, useEffect } from 'react';
import {
  getASRStatus,
  setASRProvider,
  setASRLanguageMode,
  ASRProvider,
  LanguageMode,
  ASRStatus,
} from '../core/asrService';

export function ASRSettingsPanel() {
  const [status, setStatus] = useState<ASRStatus>({
    currentProvider: 'auto',
    currentLanguageMode: 'auto',
    isConfigured: false,
  });
  const [isOpen, setIsOpen] = useState(false);

  // 加载 ASR 状态
  useEffect(() => {
    setStatus(getASRStatus());
  }, []);

  const handleProviderChange = (provider: ASRProvider) => {
    setASRProvider(provider);
    setStatus(getASRStatus());
  };

  const handleLanguageModeChange = (mode: LanguageMode) => {
    setASRLanguageMode(mode);
    setStatus(getASRStatus());
  };

  const getProviderLabel = (provider: ASRProvider | 'mock'): string => {
    switch (provider) {
      case 'browser': return '浏览器识别';
      case 'xunfei': return '讯飞实时听写';
      case 'auto': return '自动模式';
      case 'mock': return '模拟识别';
      default: return provider;
    }
  };

  const getLanguageLabel = (mode: LanguageMode): string => {
    switch (mode) {
      case 'auto': return '自动';
      case 'zh': return '中文';
      case 'en': return 'English';
      default: return mode;
    }
  };

  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('zh-CN');
  };

  const formatConfidence = (confidence?: number): string => {
    if (!confidence) return '-';
    return `${(confidence * 100).toFixed(1)}%`;
  };

  return (
    <div className="asr-settings-panel">
      <button 
        className="asr-settings-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>语音设置</span>
      </button>

      {isOpen && (
        <div className="asr-settings-content">
          {/* 识别模式 */}
          <div className="asr-setting-group">
            <label className="asr-setting-label">识别模式</label>
            <div className="asr-setting-options">
              {(['auto', 'browser', 'xunfei'] as ASRProvider[]).map((provider) => (
                <button
                  key={provider}
                  className={`asr-option ${status.currentProvider === provider ? 'active' : ''}`}
                  onClick={() => handleProviderChange(provider)}
                  disabled={provider === 'xunfei' && !status.isConfigured}
                >
                  {getProviderLabel(provider)}
                  {provider === 'xunfei' && !status.isConfigured && (
                    <span className="asr-option-warning">（未配置）</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 语言模式 */}
          <div className="asr-setting-group">
            <label className="asr-setting-label">语言模式</label>
            <div className="asr-setting-options">
              {(['auto', 'zh', 'en'] as LanguageMode[]).map((mode) => (
                <button
                  key={mode}
                  className={`asr-option ${status.currentLanguageMode === mode ? 'active' : ''}`}
                  onClick={() => handleLanguageModeChange(mode)}
                >
                  {getLanguageLabel(mode)}
                </button>
              ))}
            </div>
          </div>

          {/* 状态显示 */}
          <div className="asr-status-section">
            <h4 className="asr-status-title">当前状态</h4>
            <div className="asr-status-list">
              <div className="asr-status-item">
                <span className="asr-status-label">识别模式:</span>
                <span className="asr-status-value">{getProviderLabel(status.currentProvider)}</span>
              </div>
              <div className="asr-status-item">
                <span className="asr-status-label">云端 ASR:</span>
                <span className={`asr-status-value ${status.isConfigured ? 'configured' : 'not-configured'}`}>
                  {status.isConfigured ? '已配置' : '未配置'}
                </span>
              </div>
              
              {status.lastResult && (
                <>
                  <div className="asr-status-item">
                    <span className="asr-status-label">最近识别:</span>
                    <span className="asr-status-value">{formatTime(status.lastResult.timestamp)}</span>
                  </div>
                  <div className="asr-status-item">
                    <span className="asr-status-label">识别来源:</span>
                    <span className="asr-status-value">{getProviderLabel(status.lastResult.provider)}</span>
                  </div>
                  {status.lastResult.language && (
                    <div className="asr-status-item">
                      <span className="asr-status-label">识别语言:</span>
                      <span className="asr-status-value">{getLanguageLabel(status.lastResult.language as LanguageMode)}</span>
                    </div>
                  )}
                  {status.lastResult.confidence && (
                    <div className="asr-status-item">
                      <span className="asr-status-label">置信度:</span>
                      <span className="asr-status-value">{formatConfidence(status.lastResult.confidence)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 提示信息 */}
          {!status.isConfigured && (
            <div className="asr-notice">
              <p>未配置云端 ASR 服务时，浏览器识别和调试输入仍可正常使用。</p>
              <p>配置方法：在环境变量中设置 VITE_ASR_API_URL</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}