import * as fabric from 'fabric';
import { CommandLog, DrawAction, DrawCommand } from './commandTypes';

export interface ActionSummaryItem {
  type: DrawAction['type'];
  label: string;
  position?: string;
  count?: number;
  color?: string;
  rawText?: string;
}

export interface AISemanticContext {
  semanticPrompt: string;
  sceneDescription: string;
  actionSummary: ActionSummaryItem[];
}

const actionLabels: Partial<Record<DrawAction['type'], string>> = {
  draw_circle: '圆形',
  draw_rect: '矩形',
  draw_text: '文字',
  draw_line: '线条或地平线',
  draw_triangle: '三角形',
  draw_sun: '太阳',
  draw_cloud: '云朵',
  draw_tree: '树',
  draw_house: '房子或建筑',
  draw_landscape: '风景',
  draw_person: '人物',
  draw_cat: '猫',
  draw_dog: '狗',
  draw_car: '汽车',
  draw_flower: '花朵',
  draw_mountain: '山',
  draw_river: '河流或海水',
  draw_boat: '船',
  draw_grass: '草地',
  draw_bird: '飞鸟',
};

function isDrawAction(action: DrawAction): boolean {
  return action.type.startsWith('draw_');
}

function describePosition(
  action: DrawAction,
  canvasWidth: number,
  canvasHeight: number
): string | undefined {
  const x = action.payload?.x;
  const y = action.payload?.y;

  if (typeof x !== 'number' || typeof y !== 'number') {
    return action.payload?.position;
  }

  const horizontal = x < canvasWidth * 0.33 ? '左侧' : x > canvasWidth * 0.67 ? '右侧' : '中间';
  const vertical = y < canvasHeight * 0.33 ? '上方' : y > canvasHeight * 0.67 ? '下方' : '中部';

  if (horizontal === '中间' && vertical === '中部') return '画面中央';
  return `画面${vertical}${horizontal}`;
}

function summarizeActions(
  commands: DrawCommand[],
  canvasWidth: number,
  canvasHeight: number
): ActionSummaryItem[] {
  const items: ActionSummaryItem[] = [];

  commands.forEach((command) => {
    command.actions.filter(isDrawAction).forEach((action) => {
      const label = actionLabels[action.type] || action.type;
      items.push({
        type: action.type,
        label,
        position: describePosition(action, canvasWidth, canvasHeight),
        count: action.payload?.count,
        color: action.payload?.color,
        rawText: command.rawText,
      });
    });
  });

  return items.slice(-24);
}

function textIncludesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function hasAction(actions: ActionSummaryItem[], type: DrawAction['type']): boolean {
  return actions.some((action) => action.type === type);
}

function buildGenericObjectList(actions: ActionSummaryItem[]): string {
  const objectCounts = new Map<string, number>();

  actions.forEach((action) => {
    const count = action.count || 1;
    objectCounts.set(action.label, (objectCounts.get(action.label) || 0) + count);
  });

  return Array.from(objectCounts.entries())
    .map(([label, count]) => (count > 1 ? `${count}个${label}` : label))
    .join('、');
}

function buildSceneDescription(actions: ActionSummaryItem[], recentText: string): string {
  const isBeach =
    textIncludesAny(recentText, ['海边', '海平线', '海面', '大海', 'beach', 'sea', 'seaside']) ||
    (hasAction(actions, 'draw_boat') && hasAction(actions, 'draw_sun')) ||
    (hasAction(actions, 'draw_boat') && hasAction(actions, 'draw_bird'));

  if (isBeach) {
    return '海边日落或海面场景：画面上方是天空、太阳、云朵和飞鸟，画面下方是海平面、海水区域和小船。蓝色线条或河流形状应理解为海平面或海水，不是普通线段。';
  }

  const isPark =
    textIncludesAny(recentText, ['公园', 'park']) ||
    (hasAction(actions, 'draw_grass') && hasAction(actions, 'draw_tree') && hasAction(actions, 'draw_flower'));

  if (isPark) {
    return '公园场景：画面底部是草地，左右或背景位置有树，中间有人物，底部附近散布花朵，天空中有小鸟。';
  }

  const isCampus =
    textIncludesAny(recentText, ['校园', '教学楼', '学生', 'campus', 'school']) ||
    (hasAction(actions, 'draw_house') && hasAction(actions, 'draw_person') && hasAction(actions, 'draw_tree'));

  if (isCampus) {
    return '校园场景：画面包含教学楼或建筑、树、草地和学生人物，应转化为清晰校园插画。';
  }

  if (hasAction(actions, 'draw_cat')) {
    return '猫主题草图：画面中有一只猫，应将简笔猫转化为清晰可识别的猫，并保留它在画布中的位置。';
  }

  const objectList = buildGenericObjectList(actions);
  return objectList
    ? `结构化草图包含这些主体：${objectList}。请按它们在画布中的相对位置转化为完整插画。`
    : '结构化草图包含若干简笔图形，请根据原始构图转化为完整插画。';
}

export function buildAISemanticContext(
  commandHistory: DrawCommand[],
  logs: CommandLog[],
  canvasWidth: number,
  canvasHeight: number
): AISemanticContext {
  const recentCommands = commandHistory.slice(-8);
  const actionSummary = summarizeActions(recentCommands, canvasWidth, canvasHeight);
  const recentText = [
    ...recentCommands.map((command) => command.rawText),
    ...logs.slice(-6).map((log) => log.rawText),
  ]
    .join(' ')
    .toLowerCase();

  const sceneDescription = buildSceneDescription(actionSummary, recentText);
  const positionedObjects = actionSummary
    .map((action) => `${action.label}${action.position ? `位于${action.position}` : ''}`)
    .join('、');

  const semanticPrompt = [
    '这是一张由结构化绘图工具生成的简笔草图，画面中的符号较抽象。',
    sceneDescription,
    positionedObjects ? `结构化对象摘要：${positionedObjects}。` : '',
    '请将这些简笔符号解释为对应真实物体，保留它们的相对位置、大小关系和整体构图。',
    '特别注意不要忽略小鸟、船、花朵、猫的耳朵和尾巴等小物体或细节。',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    semanticPrompt,
    sceneDescription,
    actionSummary,
  };
}

function drawVerticalGradient(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  topColor: string,
  bottomColor: string
): void {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function drawSceneBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  sceneDescription: string
): void {
  if (sceneDescription.includes('海边') || sceneDescription.includes('海面')) {
    drawVerticalGradient(context, width, height, '#ffe2a8', '#b9e8ff');
    context.fillStyle = '#4fb3e8';
    context.fillRect(0, height * 0.62, width, height * 0.38);
    context.strokeStyle = '#2d8ac7';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, height * 0.62);
    context.lineTo(width, height * 0.62);
    context.stroke();
    return;
  }

  if (sceneDescription.includes('公园') || sceneDescription.includes('校园')) {
    drawVerticalGradient(context, width, height, '#d9f0ff', '#f7fff0');
    context.fillStyle = sceneDescription.includes('校园') ? '#d7e6c2' : '#85cf68';
    context.fillRect(0, height * 0.70, width, height * 0.30);
    return;
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load canvas export image'));
    image.src = dataUrl;
  });
}

export async function exportCanvasForAIStyle(
  canvas: fabric.Canvas,
  semanticContext: AISemanticContext
): Promise<string> {
  const width = canvas.getWidth();
  const height = canvas.getHeight();
  const originalBackground = canvas.backgroundColor;
  let originalImage: string;

  try {
    canvas.backgroundColor = 'rgba(255,255,255,0)';
    canvas.renderAll();
    originalImage = canvas.toDataURL({
      multiplier: 1,
      format: 'png',
      quality: 1,
    });
  } finally {
    canvas.backgroundColor = originalBackground;
    canvas.renderAll();
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const context = offscreen.getContext('2d');

  if (!context) {
    return originalImage;
  }

  drawSceneBackground(context, width, height, semanticContext.sceneDescription);

  const image = await loadImage(originalImage);
  context.drawImage(image, 0, 0, width, height);

  return offscreen.toDataURL('image/png', 1);
}
