export type ShapeType = 'circle' | 'rect' | 'text' | 'line' | 'triangle' | 'sun' | 'cloud' | 'tree' | 'house' |
  'person' | 'cat' | 'dog' | 'car' | 'flower' | 'mountain' | 'river' | 'boat' | 'grass' | 'bird';

export type ContextTarget = 'last' | 'largest' | 'leftmost' | 'rightmost';

export interface ShapeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface DrawAction {
  type: 'draw_circle' | 'draw_rect' | 'draw_text' | 'draw_line' | 'draw_triangle' |
         'draw_sun' | 'draw_cloud' | 'draw_tree' | 'draw_house' | 'draw_landscape' |
         'draw_person' | 'draw_cat' | 'draw_dog' | 'draw_car' | 'draw_flower' |
         'draw_mountain' | 'draw_river' | 'draw_boat' | 'draw_grass' | 'draw_bird' |
         'move' | 'delete' | 'change_color' | 'resize' | 'export_png' | 'replay' |
         'clear' | 'undo' | 'redo';
  payload?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
    text?: string;
    color?: string;
    style?: ShapeStyle;
    points?: Position[];
    target?: ContextTarget;
    targetId?: string;
    offsetX?: number;
    offsetY?: number;
    scale?: number;
    count?: number;
    size?: number;
    roofColor?: string;
    wallColor?: string;
    doorColor?: string;
  };
}

export interface DrawCommand {
  id: string;
  rawText: string;
  actions: DrawAction[];
  timestamp: number;
}

export interface CommandLog {
  id: string;
  commandId: string;
  rawText: string;
  actionTypes?: string[];
  actionCount?: number;
  status: 'pending' | 'executing' | 'success' | 'error';
  error?: string;
  timestamp: number;
  executionTime?: number;
  relationType?: string;
  language?: 'zh' | 'en' | 'mixed' | 'unknown';
}

export interface CanvasShape {
  id: string;
  name: string;
  shapeType: ShapeType;
  createdAt: number;
}
