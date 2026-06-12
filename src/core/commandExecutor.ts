import * as fabric from 'fabric';
import { DrawCommand, ContextTarget } from './commandTypes';
import { createCircle, createRect, createText, createLine, createTriangle, createSun, createCloud, createTree, createHouse, createPerson, createCat, createDog, createCar, createFlower, createMountain, createRiver, createBoat, createGrass, createBird } from './shapeFactory';
import { historyManager, getObjectState } from './historyManager';
import { getNextPosition } from './positionResolver';

const DEFAULT_COLOR = '#000000';
const MOVEMENT_STEP = 50;
const RESIZE_FACTOR = 1.2;

// Helper function to apply color to object (including groups)
function applyColorToObject(obj: fabric.Object, color: string, canvas: fabric.Canvas): void {
  // Check if it's a Group
  if (obj.type === 'group') {
    const group = obj as fabric.Group;
    // Get all objects in the group
    const objects = group.getObjects();
    objects.forEach((childObj) => {
      // Skip setting fill for Line type
      if (childObj.type !== 'line') {
        childObj.set('fill', color);
      }
      // Set stroke for all objects
      childObj.set('stroke', color);
    });
  } else {
    // For regular objects
    if (obj.type !== 'line') {
      obj.set('fill', color);
    }
    obj.set('stroke', color);
  }
  obj.setCoords();
  canvas.renderAll();
}

export class CommandExecutor {
  private canvas: fabric.Canvas | null = null;
  private lastCreatedObject: fabric.Object | null = null;

  init(canvas: fabric.Canvas): void {
    this.canvas = canvas;
    historyManager.init(canvas);
  }

  execute(command: DrawCommand): boolean {
    if (!this.canvas) return false;

    for (const action of command.actions) {
      if (!this.executeAction(action)) {
        return false;
      }
    }

    return true;
  }

  private getTargetObject(target: ContextTarget): fabric.Object | null {
    if (!this.canvas) return null;
    
    const objects = this.canvas.getObjects();
    if (objects.length === 0) return null;

    switch (target) {
      case 'last':
        return this.lastCreatedObject || objects[objects.length - 1];
      case 'largest':
        return objects.reduce((prev, curr) => {
          const prevArea = (prev.width || 0) * (prev.height || 0);
          const currArea = (curr.width || 0) * (curr.height || 0);
          return currArea > prevArea ? curr : prev;
        });
      case 'leftmost':
        return objects.reduce((prev, curr) => {
          return (curr.left || 0) < (prev.left || 0) ? curr : prev;
        });
      case 'rightmost':
        return objects.reduce((prev, curr) => {
          return (curr.left || 0) > (prev.left || 0) ? curr : prev;
        });
      default:
        return null;
    }
  }

  private setLastCreatedObject(obj: fabric.Object): void {
    this.lastCreatedObject = obj;
  }

  private executeAction(action: { type: string; payload?: Record<string, unknown> }): boolean {
    if (!this.canvas) return false;

    switch (action.type) {
      case 'draw_circle': {
        const { x, y, radius = 50, color = DEFAULT_COLOR } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const circle = createCircle(pos.x, pos.y, radius as number, color as string);
        this.canvas.add(circle);
        historyManager.addObject(circle);
        this.setLastCreatedObject(circle);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_rect': {
        const { x, y, width = 100, height = 70, color = DEFAULT_COLOR } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const rect = createRect(pos.x, pos.y, width as number, height as number, color as string);
        this.canvas.add(rect);
        historyManager.addObject(rect);
        this.setLastCreatedObject(rect);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_text': {
        const { x, y, text = '文本', color = DEFAULT_COLOR } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const fabricText = createText(pos.x, pos.y, text as string, color as string);
        this.canvas.add(fabricText);
        historyManager.addObject(fabricText);
        this.setLastCreatedObject(fabricText);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_line': {
        const { x, y, color = DEFAULT_COLOR } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const line = createLine(pos.x - 50, pos.y, pos.x + 50, pos.y, color as string);
        this.canvas.add(line);
        historyManager.addObject(line);
        this.setLastCreatedObject(line);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_triangle': {
        const { x, y, size = 80, color = DEFAULT_COLOR } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const triangle = createTriangle(pos.x, pos.y, size as number, color as string);
        this.canvas.add(triangle);
        historyManager.addObject(triangle);
        this.setLastCreatedObject(triangle);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_sun': {
        const { x, y, radius = 40 } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const sun = createSun(pos.x, pos.y, radius as number);
        this.canvas.add(sun);
        historyManager.addObject(sun);
        this.setLastCreatedObject(sun);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_cloud': {
        const payload = action.payload || {};
        const x = payload.x;
        const y = payload.y;
        const size = (payload.size as number) || 80;
        const count = (payload.count as number) || 1;
        const canvasWidth = this.canvas.width || 800;
        const canvasHeight = this.canvas.height || 600;
        
        for (let i = 0; i < count; i++) {
          let pos;
          if (x !== undefined && y !== undefined) {
            pos = { x: (x as number) + i * 100, y: y as number };
          } else {
            pos = {
              x: 100 + (canvasWidth - 200) * Math.random(),
              y: 50 + (canvasHeight / 3) * Math.random()
            };
          }
          const cloud = createCloud(pos.x, pos.y, size as number);
          this.canvas.add(cloud);
          historyManager.addObject(cloud);
          this.setLastCreatedObject(cloud);
        }
        this.canvas.renderAll();
        return true;
      }

      case 'draw_tree': {
        const { x, y } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : {
              // Fixed: proper parentheses for random position
              x: 100 + ((this.canvas.width || 800) - 200) * Math.random(),
              y: (this.canvas.height || 600) - 100
            };
        const tree = createTree(pos.x, pos.y);
        this.canvas.add(tree);
        historyManager.addObject(tree);
        this.setLastCreatedObject(tree);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_house': {
        const { x, y, roofColor = '#8B0000', wallColor = '#FFFF00', doorColor = '#8B4513' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : {
              x: (this.canvas.width || 800) / 2,
              y: (this.canvas.height || 600) - 100
            };
        const house = createHouse(pos.x, pos.y, roofColor as string, wallColor as string, doorColor as string);
        this.canvas.add(house);
        historyManager.addObject(house);
        this.setLastCreatedObject(house);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_person': {
        const { x, y, color = '#4A90D9' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const person = createPerson(pos.x, pos.y, color as string);
        this.canvas.add(person);
        historyManager.addObject(person);
        this.setLastCreatedObject(person);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_cat': {
        const { x, y, color = '#FFB347' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const cat = createCat(pos.x, pos.y, color as string);
        this.canvas.add(cat);
        historyManager.addObject(cat);
        this.setLastCreatedObject(cat);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_dog': {
        const { x, y, color = '#8B4513' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const dog = createDog(pos.x, pos.y, color as string);
        this.canvas.add(dog);
        historyManager.addObject(dog);
        this.setLastCreatedObject(dog);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_car': {
        const { x, y, color = '#E74C3C' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const car = createCar(pos.x, pos.y, color as string);
        this.canvas.add(car);
        historyManager.addObject(car);
        this.setLastCreatedObject(car);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_flower': {
        const { x, y, color = '#FF69B4' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const flower = createFlower(pos.x, pos.y, color as string);
        this.canvas.add(flower);
        historyManager.addObject(flower);
        this.setLastCreatedObject(flower);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_mountain': {
        const { x, y, color = '#8FBC8F' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : {
              x: (this.canvas.width || 800) / 2,
              y: (this.canvas.height || 600) - 50
            };
        const mountain = createMountain(pos.x, pos.y, color as string);
        this.canvas.add(mountain);
        historyManager.addObject(mountain);
        this.setLastCreatedObject(mountain);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_river': {
        const { x, y, color = '#3498DB' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : {
              x: (this.canvas.width || 800) / 2,
              y: (this.canvas.height || 600) - 80
            };
        const river = createRiver(pos.x, pos.y, color as string);
        this.canvas.add(river);
        historyManager.addObject(river);
        this.setLastCreatedObject(river);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_boat': {
        const { x, y, color = '#8B4513' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : getNextPosition(this.canvas.width || 800, this.canvas.height || 600);
        const boat = createBoat(pos.x, pos.y, color as string);
        this.canvas.add(boat);
        historyManager.addObject(boat);
        this.setLastCreatedObject(boat);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_grass': {
        const { x, y, color = '#2ECC71' } = action.payload || {};
        const pos = x !== undefined && y !== undefined 
          ? { x: x as number, y: y as number }
          : {
              x: (this.canvas.width || 800) / 2,
              y: (this.canvas.height || 600) - 10
            };
        const grass = createGrass(pos.x, pos.y, color as string);
        this.canvas.add(grass);
        historyManager.addObject(grass);
        this.setLastCreatedObject(grass);
        this.canvas.renderAll();
        return true;
      }

      case 'draw_bird': {
        const { x, y, color = '#34495E' } = action.payload || {};
        const count = (action.payload?.count as number) || 1;
        const canvasWidth = this.canvas.width || 800;
        const canvasHeight = this.canvas.height || 600;
        
        for (let i = 0; i < count; i++) {
          let pos;
          if (x !== undefined && y !== undefined) {
            pos = { x: (x as number) + i * 50, y: y as number };
          } else {
            pos = {
              x: 100 + (canvasWidth - 200) * Math.random(),
              y: 50 + (canvasHeight / 4) * Math.random()
            };
          }
          const bird = createBird(pos.x, pos.y, color as string);
          this.canvas.add(bird);
          historyManager.addObject(bird);
          this.setLastCreatedObject(bird);
        }
        this.canvas.renderAll();
        return true;
      }

      case 'draw_landscape': {
        const canvasWidth = this.canvas.width || 800;
        const canvasHeight = this.canvas.height || 600;

        const sun = createSun(canvasWidth - 100, 80, 35);
        this.canvas.add(sun);
        historyManager.addObject(sun);

        for (let i = 0; i < 3; i++) {
          const cloud = createCloud(150 + i * 180, 60 + i * 20, 70);
          this.canvas.add(cloud);
          historyManager.addObject(cloud);
        }

        for (let i = 0; i < 2; i++) {
          const tree = createTree(150 + i * 300, canvasHeight - 100);
          this.canvas.add(tree);
          historyManager.addObject(tree);
        }

        const groundLine = createLine(0, canvasHeight - 50, canvasWidth, canvasHeight - 50, '#228B22');
        this.canvas.add(groundLine);
        historyManager.addObject(groundLine);

        const grass1 = createLine(50, canvasHeight - 50, 50, canvasHeight - 30, '#32CD32');
        const grass2 = createLine(100, canvasHeight - 50, 100, canvasHeight - 25, '#228B22');
        const grass3 = createLine(150, canvasHeight - 50, 150, canvasHeight - 35, '#32CD32');
        this.canvas.add(grass1, grass2, grass3);
        historyManager.addObject(grass1);
        historyManager.addObject(grass2);
        historyManager.addObject(grass3);

        this.setLastCreatedObject(grass3);
        this.canvas.renderAll();
        return true;
      }

      case 'move': {
        const { target = 'last', offsetX = MOVEMENT_STEP, offsetY = 0 } = action.payload || {};
        const obj = this.getTargetObject(target as ContextTarget);
        if (!obj) return false;
        
        // Record before state
        const beforeState = getObjectState(obj);
        
        obj.set({
          left: (obj.left || 0) + (offsetX as number),
          top: (obj.top || 0) + (offsetY as number)
        });
        obj.setCoords();
        
        // Record after state
        const afterState = getObjectState(obj);
        historyManager.addModifyAction(obj, beforeState, afterState);
        
        this.canvas.renderAll();
        return true;
      }

      case 'delete': {
        const { target = 'last' } = action.payload || {};
        const obj = this.getTargetObject(target as ContextTarget);
        if (!obj) return false;
        
        historyManager.removeObject(obj);
        this.canvas.remove(obj);
        this.canvas.renderAll();
        return true;
      }

      case 'change_color': {
        const { target = 'last', color = DEFAULT_COLOR } = action.payload || {};
        const obj = this.getTargetObject(target as ContextTarget);
        if (!obj) return false;
        
        // Record before state
        const beforeState = getObjectState(obj);
        
        // Apply color using helper function
        applyColorToObject(obj, color as string, this.canvas);
        
        // Record after state
        const afterState = getObjectState(obj);
        historyManager.addModifyAction(obj, beforeState, afterState);
        
        this.canvas.renderAll();
        return true;
      }

      case 'resize': {
        const { target = 'last', scale = RESIZE_FACTOR } = action.payload || {};
        const obj = this.getTargetObject(target as ContextTarget);
        if (!obj) return false;
        
        // Record before state
        const beforeState = getObjectState(obj);
        
        obj.scaleToWidth((obj.width || 0) * (scale as number));
        obj.setCoords();
        
        // Record after state
        const afterState = getObjectState(obj);
        historyManager.addModifyAction(obj, beforeState, afterState);
        
        this.canvas.renderAll();
        return true;
      }

      case 'export_png': {
        const dataUrl = this.canvas.toDataURL({
          multiplier: 1,
          format: 'png',
          quality: 1
        });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `speaksketch-${Date.now()}.png`;
        link.click();
        return true;
      }

      case 'replay': {
        return true;
      }

      case 'clear': {
        historyManager.clear();
        this.lastCreatedObject = null;
        return true;
      }

      case 'undo': {
        return historyManager.undo();
      }

      case 'redo': {
        return historyManager.redo();
      }

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return false;
    }
  }

  getCanvas(): fabric.Canvas | null {
    return this.canvas;
  }
}

export const commandExecutor = new CommandExecutor();