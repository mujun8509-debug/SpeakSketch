import { DrawCommand, DrawAction, ContextTarget } from './commandTypes';
import { generateId } from '../utils/id';
import { colorMap } from './colorMap';
import { matchObjectType, extractColor as extractVocabColor } from './objectVocabulary';
import { parseRelation, hasRelation } from './relationParser';
import { CanvasPositionName, parseCanvasPositionName } from './positionResolver';

interface ParsedShape {
  type: string;
  color?: string;
  text?: string;
  count?: number;
}

interface ParsedPosition {
  x?: number;
  y?: number;
  position?: CanvasPositionName;
}

interface ParsedTarget {
  target: ContextTarget;
  targetShape?: string;
}

function extractColor(text: string): string | undefined {
  const colorNames = Object.keys(colorMap);
  for (const name of colorNames) {
    if (text.includes(name)) {
      return colorMap[name];
    }
  }
  return undefined;
}

function extractNumber(text: string): number | undefined {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractTextContent(text: string): string | undefined {
  const match = text.match(/["'“”‘’]([^"'“”‘’]+)["'“”‘’]/);
  return match ? match[1] : undefined;
}

function parseShape(text: string): ParsedShape | null {
  const color = extractColor(text);
  const count = extractNumber(text);

  if (text.includes('圆形') || text.includes('圆')) {
    return { type: 'circle', color };
  }
  
  if (text.includes('矩形') || text.includes('方形')) {
    return { type: 'rect', color };
  }
  
  if (text.includes('三角形')) {
    return { type: 'triangle', color };
  }
  
  if (text.includes('太阳')) {
    return { type: 'sun' };
  }
  
  if (text.includes('云')) {
    return { type: 'cloud', count: count || 1 };
  }
  
  if (text.includes('树')) {
    return { type: 'tree' };
  }
  
  if (text.includes('写') || text.includes('文字') || text.includes('文本')) {
    const textContent = extractTextContent(text) || '文本';
    return { type: 'text', color, text: textContent };
  }
  
  if (text.includes('直线') || text.includes('线')) {
    return { type: 'line', color };
  }
  
  return null;
}

function parseComplexObject(text: string): { type: string; color?: string; count?: number } | null {
  const objectMapping = matchObjectType(text);
  if (!objectMapping) {
    return null;
  }
  
  const color = extractVocabColor(text) || objectMapping.defaultColor;
  const count = extractNumber(text);
  
  return {
    type: objectMapping.type,
    color,
    count
  };
}

function parseParkScene(text: string): DrawAction[] {
  const actions: DrawAction[] = [];
  const hasSpecificObjects =
    text.includes('人') ||
    text.includes('树') ||
    text.includes('花') ||
    text.includes('草地') ||
    text.includes('鸟') ||
    text.includes('小鸟');
  
  if (!hasSpecificObjects || text.includes('草地')) {
    actions.push({ type: 'draw_grass', payload: { x: 400, y: 540 } });
  }
  
  if (!hasSpecificObjects || text.includes('树')) {
    actions.push({ type: 'draw_tree', payload: { x: 160, y: 380 } });
    actions.push({ type: 'draw_tree', payload: { x: 640, y: 380 } });
  }
  
  if (!hasSpecificObjects || text.includes('人')) {
    actions.push({ type: 'draw_person', payload: { x: 400, y: 360 } });
  }
  
  if (!hasSpecificObjects || text.includes('花')) {
    actions.push({ type: 'draw_flower', payload: { x: 260, y: 500 } });
    actions.push({ type: 'draw_flower', payload: { x: 420, y: 520 } });
    actions.push({ type: 'draw_flower', payload: { x: 560, y: 500 } });
  }
  
  if (!hasSpecificObjects || text.includes('鸟') || text.includes('小鸟')) {
    actions.push({ type: 'draw_bird', payload: { x: 280, y: 120, count: 3 } });
  }
  
  return actions;
}

function parseBeachScene(text: string): DrawAction[] {
  const actions: DrawAction[] = [];
  
  if (text.includes('太阳')) {
    actions.push({ type: 'draw_sun', payload: { x: 700, y: 80 } });
  }
  
  if (text.includes('云')) {
    actions.push({ type: 'draw_cloud', payload: { count: 3 } });
  }
  
  if (text.includes('船')) {
    actions.push({ type: 'draw_boat', payload: { x: 500, y: 480 } });
  }
  
  if (text.includes('海平线')) {
    actions.push({ type: 'draw_line', payload: { x: 400, y: 450, color: '#87CEEB' } });
  }
  
  if (text.includes('飞鸟')) {
    actions.push({ type: 'draw_bird', payload: { count: 2 } });
  }
  
  return actions;
}

function parseCampusScene(text: string): DrawAction[] {
  const actions: DrawAction[] = [];
  
  if (text.includes('教学楼')) {
    actions.push({ type: 'draw_house', payload: { x: 400, y: 450 } });
  }
  
  if (text.includes('树')) {
    actions.push({ type: 'draw_tree', payload: { x: 150, y: 500 } });
    actions.push({ type: 'draw_tree', payload: { x: 650, y: 500 } });
  }
  
  if (text.includes('草地')) {
    actions.push({ type: 'draw_grass', payload: { x: 400, y: 580 } });
  }
  
  if (text.includes('学生')) {
    actions.push({ type: 'draw_person', payload: { x: 300, y: 500 } });
    actions.push({ type: 'draw_person', payload: { x: 500, y: 500 } });
  }
  
  return actions;
}

function parsePosition(text: string): ParsedPosition | null {
  const position = parseCanvasPositionName(text);
  return position ? { position } : null;
}

function buildPositionPayload(pos: ParsedPosition | null): ParsedPosition {
  return pos ? { ...pos } : {};
}

function parseTarget(text: string): ParsedTarget | null {
  if (text.includes('刚才那个') || text.includes('最近那个')) {
    return { target: 'last' };
  }
  if (text.includes('最大的')) {
    return { target: 'largest' };
  }
  if (text.includes('最左边的')) {
    return { target: 'leftmost' };
  }
  if (text.includes('最右边的')) {
    return { target: 'rightmost' };
  }
  return null;
}

function parseHouseCommand(text: string): DrawAction[] {
  const actions: DrawAction[] = [];
  let roofColor = '#8B0000';
  let wallColor = '#FFFF00';
  let doorColor = '#8B4513';
  
  const colorNames = Object.keys(colorMap);
  for (const name of colorNames) {
    if (text.includes(name + '屋顶') || text.includes('屋顶' + name)) {
      roofColor = colorMap[name];
    }
    if (text.includes(name + '墙壁') || text.includes('墙壁' + name)) {
      wallColor = colorMap[name];
    }
    if (text.includes(name + '门') || text.includes('门' + name)) {
      doorColor = colorMap[name];
    }
  }
  
  const pos = parsePosition(text);
  
  actions.push({
    type: 'draw_house',
    payload: {
      ...buildPositionPayload(pos),
      roofColor,
      wallColor,
      doorColor,
    },
  });
  
  return actions;
}

function parseLandscapeCommand(text: string): DrawAction[] {
  const actions: DrawAction[] = [];
  
  if (text.includes('太阳') || text.includes('日落')) {
    actions.push({ type: 'draw_sun', payload: { x: 700, y: 80, radius: 35 } });
  }
  
  if (text.includes('云') || text.includes('云朵')) {
    actions.push({ type: 'draw_cloud', payload: { count: 3 } });
  }
  
  if (text.includes('树')) {
    actions.push({ type: 'draw_tree', payload: { x: 150, y: 500 } });
    actions.push({ type: 'draw_tree', payload: { x: 450, y: 500 } });
  }
  
  if (text.includes('海平线') || text.includes('草地') || text.includes('风景')) {
    actions.push({ type: 'draw_line', payload: { x: 400, y: 550, color: '#228B22' } });
  }
  
  if (text.includes('小船')) {
    actions.push({ type: 'draw_triangle', payload: { x: 600, y: 520, size: 40, color: '#8B4513' } });
  }
  
  return actions;
}

function parseEditCommand(text: string): DrawAction[] {
  const actions: DrawAction[] = [];
  const target = parseTarget(text) || { target: 'last' };
  const color = extractColor(text);
  
  if (text.includes('改成') || text.includes('变成') || text.includes('换')) {
    if (color) {
      actions.push({
        type: 'change_color',
        payload: { target: target.target, color },
      });
    }
    return actions;
  }
  
  if (text.includes('移动') || text.includes('移')) {
    let offsetX = 50;
    let offsetY = 0;
    
    if (text.includes('左')) offsetX = -50;
    if (text.includes('右')) offsetX = 50;
    if (text.includes('上')) offsetY = -50;
    if (text.includes('下')) offsetY = 50;
    
    actions.push({
      type: 'move',
      payload: { target: target.target, offsetX, offsetY },
    });
    return actions;
  }
  
  if (text.includes('放大') || text.includes('变大')) {
    actions.push({
      type: 'resize',
      payload: { target: target.target, scale: 1.2 },
    });
    return actions;
  }
  
  if (text.includes('缩小') || text.includes('变小')) {
    actions.push({
      type: 'resize',
      payload: { target: target.target, scale: 0.8 },
    });
    return actions;
  }
  
  if (text.includes('删除') || text.includes('移除')) {
    actions.push({
      type: 'delete',
      payload: { target: target.target },
    });
    return actions;
  }
  
  return actions;
}

export function parse(text: string): DrawCommand {
  const trimmedText = text.trim();
  
  // 1. 系统命令：clear, undo, redo, export, replay
  if (trimmedText.includes('清空') || trimmedText.includes('清除') || trimmedText.includes('擦除')) {
    return {
      id: generateId(),
      rawText: text,
      actions: [{ type: 'clear' }],
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('撤销') || trimmedText.includes('撤回')) {
    return {
      id: generateId(),
      rawText: text,
      actions: [{ type: 'undo' }],
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('重做') || trimmedText.includes('恢复')) {
    return {
      id: generateId(),
      rawText: text,
      actions: [{ type: 'redo' }],
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('导出')) {
    return {
      id: generateId(),
      rawText: text,
      actions: [{ type: 'export_png' }],
      timestamp: Date.now(),
    };
  }
  
  // 2. 编辑命令：移动、改色、删除、放大（包含"把"或"将"）
  if (trimmedText.includes('把') || trimmedText.includes('将')) {
    const editActions = parseEditCommand(trimmedText);
    if (editActions.length > 0) {
      return {
        id: generateId(),
        rawText: text,
        actions: editActions,
        timestamp: Date.now(),
      };
    }
  }
  
  // 3. 空间关系指令：需要优先识别
  if (hasRelation(trimmedText)) {
    const relationResult = parseRelation(trimmedText);
    if (relationResult && relationResult.actions.length > 0) {
      return {
        id: generateId(),
        rawText: text,
        actions: relationResult.actions,
        timestamp: Date.now(),
        relationType: relationResult.relationType,
      } as DrawCommand & { relationType?: string };
    }
  }
  
  // 4. 复杂场景：公园、海边、校园
  if (trimmedText.includes('公园')) {
    return {
      id: generateId(),
      rawText: text,
      actions: parseParkScene(trimmedText),
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('海边') || trimmedText.includes('海滩')) {
    return {
      id: generateId(),
      rawText: text,
      actions: parseBeachScene(trimmedText),
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('校园')) {
    return {
      id: generateId(),
      rawText: text,
      actions: parseCampusScene(trimmedText),
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('房子')) {
    return {
      id: generateId(),
      rawText: text,
      actions: parseHouseCommand(trimmedText),
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('风景') || trimmedText.includes('日落')) {
    return {
      id: generateId(),
      rawText: text,
      actions: parseLandscapeCommand(trimmedText),
      timestamp: Date.now(),
    };
  }
  
  if (trimmedText.includes('简单风景')) {
    return {
      id: generateId(),
      rawText: text,
      actions: [{ type: 'draw_landscape' }],
      timestamp: Date.now(),
    };
  }
  
  // 5. 复杂对象：人物、猫、狗、汽车、花、山、河、船、草地、鸟
  const complexObj = parseComplexObject(trimmedText);
  if (complexObj) {
    const pos = parsePosition(trimmedText);
    const actions: DrawAction[] = [];
    
    switch (complexObj.type) {
      case 'draw_person':
        actions.push({
          type: 'draw_person',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_cat':
        actions.push({
          type: 'draw_cat',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_dog':
        actions.push({
          type: 'draw_dog',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_car':
        actions.push({
          type: 'draw_car',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_tree':
        actions.push({
          type: 'draw_tree',
          payload: { ...buildPositionPayload(pos) },
        });
        break;
      case 'draw_house':
        actions.push({
          type: 'draw_house',
          payload: { ...buildPositionPayload(pos) },
        });
        break;
      case 'draw_flower':
        actions.push({
          type: 'draw_flower',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_mountain':
        actions.push({
          type: 'draw_mountain',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_river':
        actions.push({
          type: 'draw_river',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_boat':
        actions.push({
          type: 'draw_boat',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_grass':
        actions.push({
          type: 'draw_grass',
          payload: { ...buildPositionPayload(pos), color: complexObj.color },
        });
        break;
      case 'draw_bird':
        actions.push({
          type: 'draw_bird',
          payload: { ...buildPositionPayload(pos), count: complexObj.count, color: complexObj.color },
        });
        break;
    }
    
    return {
      id: generateId(),
      rawText: text,
      actions,
      timestamp: Date.now(),
    };
  }
  
  // 6. 基础图形：圆形、矩形、三角形、直线等
  const shape = parseShape(trimmedText);
  
  if (shape) {
    const pos = parsePosition(trimmedText);
    const actions: DrawAction[] = [];
    const color = shape.color;
    
    switch (shape.type) {
      case 'circle':
        actions.push({
          type: 'draw_circle',
          payload: { ...buildPositionPayload(pos), radius: 50, color },
        });
        break;
      case 'rect':
        actions.push({
          type: 'draw_rect',
          payload: { ...buildPositionPayload(pos), width: 100, height: 70, color },
        });
        break;
      case 'triangle':
        actions.push({
          type: 'draw_triangle',
          payload: { ...buildPositionPayload(pos), size: 80, color },
        });
        break;
      case 'sun':
        actions.push({
          type: 'draw_sun',
          payload: { ...buildPositionPayload(pos), radius: 40 },
        });
        break;
      case 'cloud':
        actions.push({
          type: 'draw_cloud',
          payload: { ...buildPositionPayload(pos), count: shape.count },
        });
        break;
      case 'tree':
        actions.push({
          type: 'draw_tree',
          payload: { ...buildPositionPayload(pos) },
        });
        break;
      case 'text':
        actions.push({
          type: 'draw_text',
          payload: { ...buildPositionPayload(pos), text: shape.text, color },
        });
        break;
      case 'line':
        actions.push({
          type: 'draw_line',
          payload: { ...buildPositionPayload(pos), color },
        });
        break;
    }
    
    return {
      id: generateId(),
      rawText: text,
      actions,
      timestamp: Date.now(),
    };
  }
  
  return {
    id: generateId(),
    rawText: text,
    actions: [],
    timestamp: Date.now(),
  };
}
