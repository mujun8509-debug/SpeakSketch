import { DrawCommand, DrawAction } from './commandTypes';
import { generateId } from '../utils/id';

export function parseEnglishCommand(text: string): DrawCommand | null {
  const trimmed = text.toLowerCase().trim();
  
  const actions: DrawAction[] = [];
  
  if (trimmed === 'undo') {
    return { id: generateId(), rawText: text, actions: [{ type: 'undo' }], timestamp: Date.now() };
  }
  
  if (trimmed === 'redo') {
    return { id: generateId(), rawText: text, actions: [{ type: 'redo' }], timestamp: Date.now() };
  }
  
  if (trimmed === 'clear the canvas' || trimmed === 'clear canvas') {
    return { id: generateId(), rawText: text, actions: [{ type: 'clear' }], timestamp: Date.now() };
  }
  
  if (trimmed === 'export image') {
    return { id: generateId(), rawText: text, actions: [{ type: 'export_png' }], timestamp: Date.now() };
  }
  
  if (trimmed === 'replay all') {
    return { id: generateId(), rawText: text, actions: [{ type: 'replay' }], timestamp: Date.now() };
  }
  
  const colorMatch = trimmed.match(/(red|blue|green|yellow|black|white|purple|orange|pink|cyan|gray|grey|brown|gold|silver)/i);
  const color = colorMatch ? getColorName(colorMatch[0].toLowerCase()) : undefined;
  
  if (trimmed.includes('draw a circle') || trimmed.includes('create a circle')) {
    actions.push({
      type: 'draw_circle',
      payload: { color },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('rectangle') || trimmed.includes('square')) {
    actions.push({
      type: 'draw_rect',
      payload: { color },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('triangle')) {
    actions.push({
      type: 'draw_triangle',
      payload: { color },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('line')) {
    actions.push({ type: 'draw_line' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  const textMatch = trimmed.match(/add text ["']([^"']+)["']/i);
  if (textMatch) {
    actions.push({
      type: 'draw_text',
      payload: { text: textMatch[1] },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a man') || trimmed.includes('draw a person') || 
      trimmed.includes('create a man') || trimmed.includes('create a person')) {
    actions.push({ type: 'draw_person' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a cat') || trimmed.includes('create a cat')) {
    actions.push({ type: 'draw_cat' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a dog') || trimmed.includes('create a dog')) {
    actions.push({ type: 'draw_dog' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if ((trimmed.includes('draw a car') || trimmed.includes('create a car')) && color) {
    actions.push({
      type: 'draw_car',
      payload: { color },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a car') || trimmed.includes('create a car')) {
    actions.push({ type: 'draw_car' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a flower') || trimmed.includes('create a flower')) {
    actions.push({
      type: 'draw_flower',
      payload: { color },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw birds') || trimmed.includes('draw some birds')) {
    const countMatch = trimmed.match(/(\d+)\s*birds/);
    actions.push({
      type: 'draw_bird',
      payload: { count: countMatch ? parseInt(countMatch[1]) : 3 },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a bird')) {
    actions.push({ type: 'draw_bird' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw birds in the sky')) {
    actions.push({
      type: 'draw_bird',
      payload: { count: 3 },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a park')) {
    actions.push({ type: 'draw_tree' });
    actions.push({ type: 'draw_flower' });
    actions.push({ type: 'draw_grass' });
    actions.push({ type: 'draw_bird', payload: { count: 2 } });
    actions.push({ type: 'draw_person' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a beach')) {
    actions.push({ type: 'draw_sun' });
    actions.push({ type: 'draw_cloud', payload: { count: 3 } });
    actions.push({ type: 'draw_boat' });
    actions.push({ type: 'draw_bird', payload: { count: 3 } });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a man next to a tree') || 
      trimmed.includes('draw a person next to a tree')) {
    actions.push({ type: 'draw_tree' });
    actions.push({ type: 'draw_person' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a cat next to a car')) {
    actions.push({ type: 'draw_car' });
    actions.push({ type: 'draw_cat' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('draw a boat on the river') || 
      trimmed.includes('draw a boat on river')) {
    actions.push({ type: 'draw_river' });
    actions.push({ type: 'draw_boat' });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('change the last shape to')) {
    const targetColor = trimmed.match(/change the last shape to (\w+)/i);
    if (targetColor) {
      actions.push({
        type: 'change_color',
        payload: { target: 'last', color: getColorName(targetColor[1]) },
      });
      return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
    }
  }
  
  if (trimmed.includes('move the last shape to the right')) {
    actions.push({
      type: 'move',
      payload: { target: 'last', offsetX: 50 },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('make the biggest shape bigger')) {
    actions.push({
      type: 'resize',
      payload: { target: 'largest', scale: 1.2 },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  if (trimmed.includes('delete the leftmost shape') || 
      trimmed.includes('remove the leftmost shape')) {
    actions.push({
      type: 'delete',
      payload: { target: 'leftmost' },
    });
    return { id: generateId(), rawText: text, actions, timestamp: Date.now() };
  }
  
  return null;
}

function getColorName(color: string): string {
  const colorMap: Record<string, string> = {
    red: '红色',
    blue: '蓝色',
    green: '绿色',
    yellow: '黄色',
    black: '黑色',
    white: '白色',
    purple: '紫色',
    orange: '橙色',
    pink: '粉色',
    cyan: '青色',
    gray: '灰色',
    grey: '灰色',
    brown: '棕色',
    gold: '金色',
    silver: '银色',
  };
  return colorMap[color.toLowerCase()] || color;
}