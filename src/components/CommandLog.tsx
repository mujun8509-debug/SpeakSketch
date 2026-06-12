import { useAppStore } from '../store/useAppStore';

export function CommandLog() {
  const { logs } = useAppStore();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN');
  };

  const formatExecutionTime = (ms?: number) => {
    if (!ms) return '';
    return `${ms}ms`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'error': return '#ef4444';
      case 'executing': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功';
      case 'error': return '失败';
      case 'executing': return '执行中';
      default: return '待处理';
    }
  };

  const getActionTypeText = (type: string) => {
    const actionMap: Record<string, string> = {
      draw_circle: '画圆形',
      draw_rect: '画矩形',
      draw_text: '写文字',
      draw_line: '画直线',
      draw_triangle: '画三角形',
      draw_sun: '画太阳',
      draw_cloud: '画云朵',
      draw_tree: '画树',
      draw_house: '画房子',
      draw_landscape: '画风景',
      draw_person: '画人物',
      draw_cat: '画猫',
      draw_dog: '画狗',
      draw_car: '画汽车',
      draw_flower: '画花',
      draw_mountain: '画山',
      draw_river: '画河',
      draw_boat: '画船',
      draw_grass: '画草地',
      draw_bird: '画鸟',
      move: '移动',
      delete: '删除',
      change_color: '改颜色',
      resize: '调整大小',
      export_png: '导出图片',
      replay: '重放',
      clear: '清空',
      undo: '撤销',
      redo: '重做',
    };
    return actionMap[type] || type;
  };

  const getRelationTypeText = (relationType?: string) => {
    const relationMap: Record<string, string> = {
      beside: '旁边',
      left: '左边',
      right: '右边',
      above: '上方',
      below: '下方',
      sky: '天空中',
      ground: '地面上',
      river_top: '河上',
    };
    return relationType ? relationMap[relationType] || relationType : '';
  };

  return (
    <div className="command-log">
      <h3 className="section-title">指令日志</h3>
      <div className="log-list">
        {logs.length === 0 ? (
          <p className="empty">暂无指令记录</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="log-item">
              <div className="log-header">
                <span className="log-time">{formatTime(log.timestamp)}</span>
                <span 
                  className="log-status"
                  style={{ color: getStatusColor(log.status) }}
                >
                  {getStatusText(log.status)}
                </span>
                {log.executionTime && (
                  <span className="log-exec-time">{formatExecutionTime(log.executionTime)}</span>
                )}
              </div>
              <div className="log-content">
                <span className="log-text">{log.rawText}</span>
              </div>
              {log.actionCount !== undefined && log.actionCount > 0 && (
                <div className="log-actions">
                  {log.relationType && (
                    <span className="log-relation-type">空间关系: {getRelationTypeText(log.relationType)}</span>
                  )}
                  <span className="log-action-count">动作: {log.actionCount} 个</span>
                  {log.actionTypes && log.actionTypes.length > 0 && (
                    <div className="log-action-types">
                      {log.actionTypes.map((type, index) => (
                        <span key={index} className="action-tag">
                          {getActionTypeText(type)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {log.error && (
                <span className="log-error">{log.error}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
