export interface Position {
  x: number;
  y: number;
}

export type CanvasPositionName =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center'
  | 'left'
  | 'right'
  | 'top'
  | 'bottom';

const POSITION_RATIOS: Record<CanvasPositionName, Position> = {
  'top-left': { x: 0.18, y: 0.18 },
  'top-right': { x: 0.82, y: 0.18 },
  'bottom-left': { x: 0.18, y: 0.78 },
  'bottom-right': { x: 0.82, y: 0.78 },
  center: { x: 0.5, y: 0.5 },
  left: { x: 0.2, y: 0.5 },
  right: { x: 0.8, y: 0.5 },
  top: { x: 0.5, y: 0.2 },
  bottom: { x: 0.5, y: 0.78 },
};

const POSITION_KEYWORDS: Array<{ name: CanvasPositionName; keywords: string[] }> = [
  { name: 'top-left', keywords: ['左上角', '左上方', 'top left', 'top-left'] },
  { name: 'top-right', keywords: ['右上角', '右上方', 'top right', 'top-right'] },
  { name: 'bottom-left', keywords: ['左下角', '左下方', 'bottom left', 'bottom-left'] },
  { name: 'bottom-right', keywords: ['右下角', '右下方', 'bottom right', 'bottom-right'] },
  { name: 'center', keywords: ['画布中央', '画布中间', '中间', '中央', 'center', 'middle'] },
  { name: 'left', keywords: ['左边', '左侧', 'left'] },
  { name: 'right', keywords: ['右边', '右侧', 'right'] },
  { name: 'top', keywords: ['上方', '顶部', '上边', 'top'] },
  { name: 'bottom', keywords: ['下方', '底部', '下边', 'bottom'] },
];

export function resolveCanvasPosition(
  position: CanvasPositionName,
  canvasWidth: number,
  canvasHeight: number
): Position {
  const ratio = POSITION_RATIOS[position];
  return {
    x: canvasWidth * ratio.x,
    y: canvasHeight * ratio.y,
  };
}

export function parseCanvasPositionName(text: string): CanvasPositionName | null {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ');

  for (const item of POSITION_KEYWORDS) {
    if (item.keywords.some(keyword => normalized.includes(keyword))) {
      return item.name;
    }
  }

  return null;
}

export function getRandomPosition(canvasWidth: number, canvasHeight: number, shapeSize: number): Position {
  const padding = 50;
  const maxX = canvasWidth - shapeSize - padding;
  const maxY = canvasHeight - shapeSize - padding;
  return {
    x: padding + Math.random() * maxX,
    y: padding + Math.random() * maxY,
  };
}

export function getCenterPosition(canvasWidth: number, canvasHeight: number): Position {
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
  };
}

let shapeIndex = 0;

export function getNextPosition(canvasWidth: number, canvasHeight: number): Position {
  const slots: Position[] = [
    { x: 0.5, y: 0.5 },
    { x: 0.35, y: 0.5 },
    { x: 0.65, y: 0.5 },
    { x: 0.5, y: 0.35 },
    { x: 0.5, y: 0.65 },
    { x: 0.25, y: 0.35 },
    { x: 0.75, y: 0.35 },
    { x: 0.25, y: 0.7 },
    { x: 0.75, y: 0.7 },
  ];

  const slot = slots[shapeIndex % slots.length];
  shapeIndex = (shapeIndex + 1) % slots.length;

  return {
    x: canvasWidth * slot.x,
    y: canvasHeight * slot.y,
  };
}

export function resetPositionIndex(): void {
  shapeIndex = 0;
}
