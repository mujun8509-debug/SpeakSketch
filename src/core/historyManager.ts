import * as fabric from 'fabric';

interface ObjectState {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  fill?: string;
  stroke?: string;
}

interface HistoryAction {
  type: 'add' | 'remove' | 'clear' | 'modify';
  objects: fabric.Object[];
  beforeStates?: ObjectState[];
  afterStates?: ObjectState[];
}

function getObjectState(obj: fabric.Object): ObjectState {
  return {
    left: obj.left || 0,
    top: obj.top || 0,
    scaleX: obj.scaleX || 1,
    scaleY: obj.scaleY || 1,
    fill: obj.fill as string | undefined,
    stroke: obj.stroke as string | undefined,
  };
}

function applyObjectState(obj: fabric.Object, state: ObjectState): void {
  obj.set({
    left: state.left,
    top: state.top,
    scaleX: state.scaleX,
    scaleY: state.scaleY,
    fill: state.fill,
    stroke: state.stroke,
  });
  obj.setCoords();
}

export class HistoryManager {
  private history: HistoryAction[] = [];
  private historyIndex = -1;
  private canvas: fabric.Canvas | null = null;

  init(canvas: fabric.Canvas): void {
    this.canvas = canvas;
  }

  addAction(action: HistoryAction): void {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(action);
    this.historyIndex++;
  }

  undo(): boolean {
    if (this.historyIndex < 0 || !this.canvas) return false;

    const action = this.history[this.historyIndex];
    switch (action.type) {
      case 'add':
        action.objects.forEach(obj => {
          this.canvas?.remove(obj);
        });
        break;
      case 'remove':
        action.objects.forEach(obj => {
          this.canvas?.add(obj);
        });
        break;
      case 'clear':
        action.objects.forEach(obj => {
          this.canvas?.add(obj);
        });
        break;
      case 'modify':
        if (action.objects && action.beforeStates) {
          action.objects.forEach((obj, i) => {
            applyObjectState(obj, action.beforeStates![i]);
          });
        }
        break;
    }
    this.historyIndex--;
    this.canvas.renderAll();
    return true;
  }

  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1 || !this.canvas) return false;

    this.historyIndex++;
    const action = this.history[this.historyIndex];
    switch (action.type) {
      case 'add':
        action.objects.forEach(obj => {
          this.canvas?.add(obj);
        });
        break;
      case 'remove':
        action.objects.forEach(obj => {
          this.canvas?.remove(obj);
        });
        break;
      case 'clear':
        this.canvas.clear();
        break;
      case 'modify':
        if (action.objects && action.afterStates) {
          action.objects.forEach((obj, i) => {
            applyObjectState(obj, action.afterStates![i]);
          });
        }
        break;
    }
    this.canvas.renderAll();
    return true;
  }

  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  clear(): void {
    if (!this.canvas) return;
    
    const objects = this.canvas.getObjects();
    this.addAction({
      type: 'clear',
      objects: [...objects],
    });
    this.canvas.clear();
    this.canvas.renderAll();
  }

  addObject(obj: fabric.Object): void {
    this.addAction({
      type: 'add',
      objects: [obj],
    });
  }

  removeObject(obj: fabric.Object): void {
    this.addAction({
      type: 'remove',
      objects: [obj],
    });
  }

  addModifyAction(obj: fabric.Object, beforeState: ObjectState, afterState: ObjectState): void {
    this.addAction({
      type: 'modify',
      objects: [obj],
      beforeStates: [beforeState],
      afterStates: [afterState],
    });
  }

  getHistoryCount(): number {
    return this.history.length;
  }
}

export const historyManager = new HistoryManager();
export { getObjectState };