import * as fabric from 'fabric';
import type { ShapeType, CanvasShape } from './commandTypes';
import { generateId } from '../utils/id';

export function createCircle(
  x: number,
  y: number,
  radius: number,
  color: string
): fabric.Circle & CanvasShape {
  const circle = new fabric.Circle({
    left: x - radius,
    top: y - radius,
    radius,
    fill: color,
    stroke: color,
    strokeWidth: 2,
  }) as fabric.Circle & CanvasShape;
  
  circle.id = generateId();
  circle.name = '圆形';
  circle.shapeType = 'circle';
  circle.createdAt = Date.now();
  
  return circle;
}

export function createRect(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
): fabric.Rect & CanvasShape {
  const rect = new fabric.Rect({
    left: x - width / 2,
    top: y - height / 2,
    width,
    height,
    fill: color,
    stroke: color,
    strokeWidth: 2,
  }) as fabric.Rect & CanvasShape;
  
  rect.id = generateId();
  rect.name = '矩形';
  rect.shapeType = 'rect';
  rect.createdAt = Date.now();
  
  return rect;
}

export function createText(
  x: number,
  y: number,
  text: string,
  color: string
): fabric.Text & CanvasShape {
  const fabricText = new fabric.Text(text, {
    left: x,
    top: y,
    fill: color,
    fontSize: 24,
    fontWeight: 'bold',
  }) as fabric.Text & CanvasShape;
  
  fabricText.id = generateId();
  fabricText.name = '文本';
  fabricText.shapeType = 'text';
  fabricText.createdAt = Date.now();
  
  return fabricText;
}

export function createLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string
): fabric.Line & CanvasShape {
  const line = new fabric.Line([x1, y1, x2, y2], {
    stroke: color,
    strokeWidth: 3,
  }) as fabric.Line & CanvasShape;
  
  line.id = generateId();
  line.name = '直线';
  line.shapeType = 'line';
  line.createdAt = Date.now();
  
  return line;
}

export function createTriangle(
  x: number,
  y: number,
  size: number,
  color: string
): fabric.Triangle & CanvasShape {
  const triangle = new fabric.Triangle({
    left: x - size / 2,
    top: y - size / 2,
    width: size,
    height: size,
    fill: color,
    stroke: color,
    strokeWidth: 2,
  }) as fabric.Triangle & CanvasShape;
  
  triangle.id = generateId();
  triangle.name = '三角形';
  triangle.shapeType = 'triangle';
  triangle.createdAt = Date.now();
  
  return triangle;
}

export function createSun(
  x: number,
  y: number,
  radius: number
): fabric.Group & CanvasShape {
  const centerX = x;
  const centerY = y;
  
  const circle = new fabric.Circle({
    left: centerX - radius,
    top: centerY - radius,
    radius,
    fill: '#FFD700',
    stroke: '#FFA500',
    strokeWidth: 3,
  });
  
  const rays: fabric.Line[] = [];
  const rayCount = 8;
  const rayLength = radius + 20;
  
  for (let i = 0; i < rayCount; i++) {
    const angle = (i * 360 / rayCount) * (Math.PI / 180);
    const x1 = centerX + Math.cos(angle) * radius * 1.2;
    const y1 = centerY + Math.sin(angle) * radius * 1.2;
    const x2 = centerX + Math.cos(angle) * rayLength;
    const y2 = centerY + Math.sin(angle) * rayLength;
    
    rays.push(new fabric.Line([x1, y1, x2, y2], {
      stroke: '#FFD700',
      strokeWidth: 4,
    }));
  }
  
  const group = new fabric.Group([circle, ...rays], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;
  
  group.id = generateId();
  group.name = '太阳';
  group.shapeType = 'sun';
  group.createdAt = Date.now();
  
  return group;
}

export function createCloud(
  x: number,
  y: number,
  size: number
): fabric.Group & CanvasShape {
  const parts: fabric.Circle[] = [];
  const baseRadius = size / 3;
  
  parts.push(new fabric.Circle({
    left: x - baseRadius,
    top: y - baseRadius * 0.8,
    radius: baseRadius * 1.2,
    fill: '#FFFFFF',
    stroke: '#E0E0E0',
    strokeWidth: 2,
  }));
  
  parts.push(new fabric.Circle({
    left: x + baseRadius * 0.5,
    top: y - baseRadius * 0.5,
    radius: baseRadius,
    fill: '#FFFFFF',
    stroke: '#E0E0E0',
    strokeWidth: 2,
  }));
  
  parts.push(new fabric.Circle({
    left: x + baseRadius * 1.5,
    top: y - baseRadius * 0.8,
    radius: baseRadius * 1.1,
    fill: '#FFFFFF',
    stroke: '#E0E0E0',
    strokeWidth: 2,
  }));
  
  parts.push(new fabric.Circle({
    left: x + baseRadius * 0.2,
    top: y + baseRadius * 0.3,
    radius: baseRadius * 0.9,
    fill: '#FFFFFF',
    stroke: '#E0E0E0',
    strokeWidth: 2,
  }));
  
  const group = new fabric.Group(parts, {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;
  
  group.id = generateId();
  group.name = '云朵';
  group.shapeType = 'cloud';
  group.createdAt = Date.now();
  
  return group;
}

export function createTree(
  x: number,
  y: number
): fabric.Group & CanvasShape {
  const trunkWidth = 20;
  const trunkHeight = 80;
  const canopyRadius = 50;
  
  const trunk = new fabric.Rect({
    left: x - trunkWidth / 2,
    top: y,
    width: trunkWidth,
    height: trunkHeight,
    fill: '#8B4513',
    stroke: '#5D3A1A',
    strokeWidth: 2,
  });
  
  const canopy1 = new fabric.Circle({
    left: x - canopyRadius,
    top: y - canopyRadius * 1.5,
    radius: canopyRadius,
    fill: '#228B22',
    stroke: '#006400',
    strokeWidth: 2,
  });
  
  const canopy2 = new fabric.Circle({
    left: x - canopyRadius * 0.8,
    top: y - canopyRadius * 2.5,
    radius: canopyRadius * 0.8,
    fill: '#32CD32',
    stroke: '#228B22',
    strokeWidth: 2,
  });
  
  const canopy3 = new fabric.Circle({
    left: x - canopyRadius * 0.6,
    top: y - canopyRadius * 3.3,
    radius: canopyRadius * 0.6,
    fill: '#90EE90',
    stroke: '#32CD32',
    strokeWidth: 2,
  });
  
  const group = new fabric.Group([trunk, canopy1, canopy2, canopy3], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;
  
  group.id = generateId();
  group.name = '树';
  group.shapeType = 'tree';
  group.createdAt = Date.now();
  
  return group;
}

export function createHouse(
  x: number,
  y: number,
  roofColor: string = '#8B0000',
  wallColor: string = '#FFFF00',
  doorColor: string = '#8B4513'
): fabric.Group & CanvasShape {
  const wallWidth = 120;
  const wallHeight = 100;
  const roofHeight = 60;
  const doorWidth = 30;
  const doorHeight = 50;
  
  const wall = new fabric.Rect({
    left: x - wallWidth / 2,
    top: y,
    width: wallWidth,
    height: wallHeight,
    fill: wallColor,
    stroke: '#333',
    strokeWidth: 2,
  });
  
  const roof = new fabric.Triangle({
    left: x - wallWidth / 2,
    top: y - roofHeight,
    width: wallWidth,
    height: roofHeight,
    fill: roofColor,
    stroke: '#333',
    strokeWidth: 2,
  });
  
  const door = new fabric.Rect({
    left: x - doorWidth / 2,
    top: y + wallHeight - doorHeight,
    width: doorWidth,
    height: doorHeight,
    fill: doorColor,
    stroke: '#333',
    strokeWidth: 2,
  });
  
  const doorknob = new fabric.Circle({
    left: x + doorWidth / 2 - 8,
    top: y + wallHeight - doorHeight / 2 - 3,
    radius: 3,
    fill: '#FFD700',
  });
  
  const group = new fabric.Group([wall, roof, door, doorknob], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;
  
  group.id = generateId();
  group.name = '房子';
  group.shapeType = 'house';
  group.createdAt = Date.now();
  
  return group;
}

export function createPerson(
  x: number,
  y: number,
  color: string = '#4A90D9'
): fabric.Group & CanvasShape {
  const headRadius = 20;
  const bodyHeight = 50;
  const bodyWidth = 25;
  const armLength = 35;
  const legLength = 40;

  const head = new fabric.Circle({
    left: x - headRadius,
    top: y - headRadius - bodyHeight - headRadius,
    radius: headRadius,
    fill: '#FFE4C4',
    stroke: '#333',
    strokeWidth: 2,
  });

  const body = new fabric.Rect({
    left: x - bodyWidth / 2,
    top: y - bodyHeight - headRadius,
    width: bodyWidth,
    height: bodyHeight,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
  });

  const leftArm = new fabric.Line([x - bodyWidth / 2, y - bodyHeight - headRadius + 10, x - bodyWidth / 2 - armLength, y - bodyHeight - headRadius + 30], {
    stroke: color,
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const rightArm = new fabric.Line([x + bodyWidth / 2, y - bodyHeight - headRadius + 10, x + bodyWidth / 2 + armLength, y - bodyHeight - headRadius + 30], {
    stroke: color,
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const leftLeg = new fabric.Line([x - bodyWidth / 2 + 5, y - headRadius, x - bodyWidth / 2 + 5, y - headRadius + legLength], {
    stroke: '#1E90FF',
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const rightLeg = new fabric.Line([x + bodyWidth / 2 - 5, y - headRadius, x + bodyWidth / 2 - 5, y - headRadius + legLength], {
    stroke: '#1E90FF',
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const group = new fabric.Group([head, body, leftArm, rightArm, leftLeg, rightLeg], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '人物';
  group.shapeType = 'person';
  group.createdAt = Date.now();

  return group;
}

export function createCat(
  x: number,
  y: number,
  color: string = '#FFB347'
): fabric.Group & CanvasShape {
  const headRadius = 20;
  const bodyWidth = 40;
  const bodyHeight = 35;
  const earHeight = 15;
  const tailLength = 35;

  const head = new fabric.Circle({
    left: x - headRadius,
    top: y - headRadius - bodyHeight,
    radius: headRadius,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
  });

  const body = new fabric.Ellipse({
    left: x - bodyWidth / 2,
    top: y - bodyHeight,
    rx: bodyWidth / 2,
    ry: bodyHeight / 2,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
  });

  const leftEar = new fabric.Triangle({
    left: x - headRadius - 8,
    top: y - headRadius - bodyHeight - earHeight,
    width: 12,
    height: earHeight,
    fill: '#FFB6C1',
    stroke: '#333',
    strokeWidth: 2,
  });

  const rightEar = new fabric.Triangle({
    left: x + headRadius - 4,
    top: y - headRadius - bodyHeight - earHeight,
    width: 12,
    height: earHeight,
    fill: '#FFB6C1',
    stroke: '#333',
    strokeWidth: 2,
  });

  const tail = new fabric.Line([x + bodyWidth / 2, y - bodyHeight / 2, x + bodyWidth / 2 + tailLength, y - bodyHeight], {
    stroke: color,
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const leftWhisker1 = new fabric.Line([x - headRadius - 15, y - headRadius - bodyHeight + 5, x - headRadius - 35, y - headRadius - bodyHeight + 2], {
    stroke: '#333',
    strokeWidth: 2,
  });

  const leftWhisker2 = new fabric.Line([x - headRadius - 15, y - headRadius - bodyHeight + 10, x - headRadius - 35, y - headRadius - bodyHeight + 10], {
    stroke: '#333',
    strokeWidth: 2,
  });

  const rightWhisker1 = new fabric.Line([x + headRadius + 15, y - headRadius - bodyHeight + 5, x + headRadius + 35, y - headRadius - bodyHeight + 2], {
    stroke: '#333',
    strokeWidth: 2,
  });

  const rightWhisker2 = new fabric.Line([x + headRadius + 15, y - headRadius - bodyHeight + 10, x + headRadius + 35, y - headRadius - bodyHeight + 10], {
    stroke: '#333',
    strokeWidth: 2,
  });

  const group = new fabric.Group([head, body, leftEar, rightEar, tail, leftWhisker1, leftWhisker2, rightWhisker1, rightWhisker2], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '猫';
  group.shapeType = 'cat';
  group.createdAt = Date.now();

  return group;
}

export function createDog(
  x: number,
  y: number,
  color: string = '#8B4513'
): fabric.Group & CanvasShape {
  const headRadius = 22;
  const bodyWidth = 50;
  const bodyHeight = 40;
  const earHeight = 20;
  const tailLength = 40;
  const legLength = 30;

  const head = new fabric.Circle({
    left: x - headRadius,
    top: y - headRadius - bodyHeight,
    radius: headRadius,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
  });

  const body = new fabric.Ellipse({
    left: x - bodyWidth / 2,
    top: y - bodyHeight,
    rx: bodyWidth / 2,
    ry: bodyHeight / 2,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
  });

  const leftEar = new fabric.Triangle({
    left: x - headRadius - 10,
    top: y - headRadius - bodyHeight - earHeight,
    width: 15,
    height: earHeight,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
    angle: -30,
  });

  const rightEar = new fabric.Triangle({
    left: x + headRadius - 5,
    top: y - headRadius - bodyHeight - earHeight,
    width: 15,
    height: earHeight,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
    angle: 30,
  });

  const tail = new fabric.Line([x + bodyWidth / 2, y - bodyHeight / 2, x + bodyWidth / 2 + tailLength, y - bodyHeight / 2 - 20], {
    stroke: color,
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const leftFrontLeg = new fabric.Line([x - bodyWidth / 2 + 8, y, x - bodyWidth / 2 + 8, y + legLength], {
    stroke: '#654321',
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const rightFrontLeg = new fabric.Line([x + bodyWidth / 2 - 8, y, x + bodyWidth / 2 - 8, y + legLength], {
    stroke: '#654321',
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const leftBackLeg = new fabric.Line([x - bodyWidth / 2 + 15, y, x - bodyWidth / 2 + 15, y + legLength], {
    stroke: '#654321',
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const rightBackLeg = new fabric.Line([x + bodyWidth / 2 - 15, y, x + bodyWidth / 2 - 15, y + legLength], {
    stroke: '#654321',
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const group = new fabric.Group([head, body, leftEar, rightEar, tail, leftFrontLeg, rightFrontLeg, leftBackLeg, rightBackLeg], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '狗';
  group.shapeType = 'dog';
  group.createdAt = Date.now();

  return group;
}

export function createCar(
  x: number,
  y: number,
  color: string = '#E74C3C'
): fabric.Group & CanvasShape {
  const bodyWidth = 80;
  const bodyHeight = 35;
  const roofWidth = 40;
  const roofHeight = 25;
  const wheelRadius = 12;

  const body = new fabric.Rect({
    left: x - bodyWidth / 2,
    top: y,
    width: bodyWidth,
    height: bodyHeight,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
  });

  const roof = new fabric.Rect({
    left: x - roofWidth / 2,
    top: y - roofHeight,
    width: roofWidth,
    height: roofHeight,
    fill: color,
    stroke: '#333',
    strokeWidth: 2,
  });

  const window = new fabric.Rect({
    left: x - roofWidth / 2 + 5,
    top: y - roofHeight + 5,
    width: roofWidth - 10,
    height: roofHeight - 10,
    fill: '#87CEEB',
    stroke: '#333',
    strokeWidth: 1,
  });

  const leftWheel = new fabric.Circle({
    left: x - bodyWidth / 2 + 15 - wheelRadius,
    top: y + bodyHeight - wheelRadius - 5,
    radius: wheelRadius,
    fill: '#2C2C2C',
    stroke: '#000',
    strokeWidth: 2,
  });

  const rightWheel = new fabric.Circle({
    left: x + bodyWidth / 2 - 15 - wheelRadius,
    top: y + bodyHeight - wheelRadius - 5,
    radius: wheelRadius,
    fill: '#2C2C2C',
    stroke: '#000',
    strokeWidth: 2,
  });

  const group = new fabric.Group([body, roof, window, leftWheel, rightWheel], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '汽车';
  group.shapeType = 'car';
  group.createdAt = Date.now();

  return group;
}

export function createFlower(
  x: number,
  y: number,
  color: string = '#FF69B4'
): fabric.Group & CanvasShape {
  const petalRadius = 15;
  const centerRadius = 12;
  const stemHeight = 60;
  const leafSize = 15;

  const petals: fabric.Ellipse[] = [];
  const petalCount = 6;
  
  for (let i = 0; i < petalCount; i++) {
    const angle = (i * 360 / petalCount) * (Math.PI / 180);
    const px = x + Math.cos(angle) * 20 - petalRadius / 2;
    const py = y - centerRadius - 20 + Math.sin(angle) * 20 - petalRadius / 2;
    petals.push(new fabric.Ellipse({
      left: px,
      top: py,
      rx: petalRadius / 2,
      ry: petalRadius,
      fill: color,
      stroke: '#CC55AA',
      strokeWidth: 2,
      angle: (i * 60) % 360,
    }));
  }

  const center = new fabric.Circle({
    left: x - centerRadius,
    top: y - centerRadius - 20,
    radius: centerRadius,
    fill: '#FFD700',
    stroke: '#FFA500',
    strokeWidth: 2,
  });

  const stem = new fabric.Line([x, y, x, y + stemHeight], {
    stroke: '#228B22',
    strokeWidth: 6,
    strokeLineCap: 'round',
  });

  const leftLeaf = new fabric.Ellipse({
    left: x - leafSize - 15,
    top: y + stemHeight / 2 - leafSize,
    rx: leafSize,
    ry: leafSize / 2,
    fill: '#32CD32',
    stroke: '#228B22',
    strokeWidth: 2,
    angle: -45,
  });

  const rightLeaf = new fabric.Ellipse({
    left: x + 15,
    top: y + stemHeight / 2 - leafSize,
    rx: leafSize,
    ry: leafSize / 2,
    fill: '#32CD32',
    stroke: '#228B22',
    strokeWidth: 2,
    angle: 45,
  });

  const group = new fabric.Group([...petals, center, stem, leftLeaf, rightLeaf], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '花';
  group.shapeType = 'flower';
  group.createdAt = Date.now();

  return group;
}

export function createMountain(
  x: number,
  y: number,
  color: string = '#8FBC8F'
): fabric.Group & CanvasShape {
  const mountainWidth = 120;
  const mountainHeight = 80;

  const triangle1 = new fabric.Triangle({
    left: x - mountainWidth / 2,
    top: y - mountainHeight,
    width: mountainWidth,
    height: mountainHeight,
    fill: color,
    stroke: '#5D9B5D',
    strokeWidth: 2,
  });

  const triangle2 = new fabric.Triangle({
    left: x - mountainWidth / 3,
    top: y - mountainHeight * 0.7,
    width: mountainWidth * 0.7,
    height: mountainHeight * 0.7,
    fill: '#98FB98',
    stroke: '#7CCD7C',
    strokeWidth: 2,
  });

  const snowCap = new fabric.Triangle({
    left: x - mountainWidth / 6,
    top: y - mountainHeight,
    width: mountainWidth / 3,
    height: mountainHeight / 3,
    fill: '#FFFFFF',
    stroke: '#E0E0E0',
    strokeWidth: 2,
  });

  const group = new fabric.Group([triangle1, triangle2, snowCap], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '山';
  group.shapeType = 'mountain';
  group.createdAt = Date.now();

  return group;
}

export function createRiver(
  x: number,
  y: number,
  color: string = '#3498DB'
): fabric.Group & CanvasShape {
  const riverWidth = 60;
  const riverLength = 150;

  const curve1 = new fabric.Line([x - riverLength / 2, y, x - riverLength / 4, y + 15], {
    stroke: color,
    strokeWidth: riverWidth,
    strokeLineCap: 'round',
  });

  const curve2 = new fabric.Line([x - riverLength / 4, y + 15, x, y], {
    stroke: color,
    strokeWidth: riverWidth,
    strokeLineCap: 'round',
  });

  const curve3 = new fabric.Line([x, y, x + riverLength / 4, y + 15], {
    stroke: color,
    strokeWidth: riverWidth,
    strokeLineCap: 'round',
  });

  const curve4 = new fabric.Line([x + riverLength / 4, y + 15, x + riverLength / 2, y], {
    stroke: color,
    strokeWidth: riverWidth,
    strokeLineCap: 'round',
  });

  const group = new fabric.Group([curve1, curve2, curve3, curve4], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '河流';
  group.shapeType = 'river';
  group.createdAt = Date.now();

  return group;
}

export function createBoat(
  x: number,
  y: number,
  color: string = '#8B4513'
): fabric.Group & CanvasShape {
  const boatWidth = 80;
  const boatHeight = 25;
  const mastHeight = 50;
  const sailWidth = 30;
  const sailHeight = 40;

  const hull = new fabric.Ellipse({
    left: x - boatWidth / 2,
    top: y - boatHeight / 2,
    rx: boatWidth / 2,
    ry: boatHeight / 2,
    fill: color,
    stroke: '#5D3A1A',
    strokeWidth: 2,
  });

  const mast = new fabric.Line([x, y - boatHeight / 2 - 5, x, y - boatHeight / 2 - mastHeight - 5], {
    stroke: '#5D3A1A',
    strokeWidth: 5,
    strokeLineCap: 'round',
  });

  const sail = new fabric.Triangle({
    left: x - sailWidth / 2,
    top: y - boatHeight / 2 - mastHeight - 5,
    width: sailWidth,
    height: sailHeight,
    fill: '#FFFFFF',
    stroke: '#87CEEB',
    strokeWidth: 2,
    angle: 90,
  });

  const group = new fabric.Group([hull, mast, sail], {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '船';
  group.shapeType = 'boat';
  group.createdAt = Date.now();

  return group;
}

export function createGrass(
  x: number,
  y: number,
  color: string = '#2ECC71'
): fabric.Group & CanvasShape {
  const grassBlades: fabric.Line[] = [];
  const bladeCount = 15;
  const bladeLength = 30;

  for (let i = 0; i < bladeCount; i++) {
    const bx = x - 80 + i * 12;
    const by = y;
    const angle = (Math.random() - 0.5) * 0.5;
    grassBlades.push(new fabric.Line([bx, by, bx + Math.sin(angle) * bladeLength, by - bladeLength], {
      stroke: color,
      strokeWidth: 4,
      strokeLineCap: 'round',
    }));
  }

  const group = new fabric.Group(grassBlades, {
    left: 0,
    top: 0,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '草地';
  group.shapeType = 'grass';
  group.createdAt = Date.now();

  return group;
}

export function createBird(
  x: number,
  y: number,
  color: string = '#34495E'
): fabric.Group & CanvasShape {
  const bodySize = 25;
  const wingSize = 20;

  const body = new fabric.Ellipse({
    left: x - bodySize / 2,
    top: y - bodySize / 2,
    rx: bodySize / 2,
    ry: bodySize / 3,
    fill: color,
    stroke: '#2C3E50',
    strokeWidth: 2,
  });

  const head = new fabric.Circle({
    left: x + bodySize / 2 - 10,
    top: y - 8,
    radius: 8,
    fill: color,
    stroke: '#2C3E50',
    strokeWidth: 2,
  });

  const beak = new fabric.Triangle({
    left: x + bodySize / 2,
    top: y - 3,
    width: 10,
    height: 6,
    fill: '#FFD700',
    stroke: '#FFA500',
    strokeWidth: 1,
    angle: 90,
  });

  const wing = new fabric.Ellipse({
    left: x - bodySize / 2 + 5,
    top: y - bodySize / 2 - 5,
    rx: wingSize / 2,
    ry: wingSize / 3,
    fill: color,
    stroke: '#2C3E50',
    strokeWidth: 2,
    angle: -30,
  });

  const tail = new fabric.Line([x - bodySize / 2, y, x - bodySize / 2 - 15, y + 10], {
    stroke: color,
    strokeWidth: 4,
    strokeLineCap: 'round',
  });

  const group = new fabric.Group([body, head, beak, wing, tail], {
    left: 0,
    top: y - 50,
  }) as fabric.Group & CanvasShape;

  group.id = generateId();
  group.name = '鸟';
  group.shapeType = 'bird';
  group.createdAt = Date.now();

  return group;
}

export function createShape(
  type: ShapeType,
  x: number,
  y: number,
  color: string,
  options?: { radius?: number; width?: number; height?: number; text?: string }
): fabric.Object & CanvasShape {
  switch (type) {
    case 'circle':
      return createCircle(x, y, options?.radius || 50, color);
    case 'rect':
      return createRect(x, y, options?.width || 100, options?.height || 70, color);
    case 'text':
      return createText(x, y, options?.text || '文本', color);
    case 'line':
      return createLine(x - 50, y, x + 50, y, color);
    case 'triangle':
      return createTriangle(x, y, options?.width || 80, color);
    case 'sun':
      return createSun(x, y, options?.radius || 40);
    case 'cloud':
      return createCloud(x, y, options?.width || 80);
    case 'tree':
      return createTree(x, y);
    case 'house':
      return createHouse(x, y, color);
    case 'person':
      return createPerson(x, y, color);
    case 'cat':
      return createCat(x, y, color);
    case 'dog':
      return createDog(x, y, color);
    case 'car':
      return createCar(x, y, color);
    case 'flower':
      return createFlower(x, y, color);
    case 'mountain':
      return createMountain(x, y, color);
    case 'river':
      return createRiver(x, y, color);
    case 'boat':
      return createBoat(x, y, color);
    case 'grass':
      return createGrass(x, y, color);
    case 'bird':
      return createBird(x, y, color);
    default:
      throw new Error(`Unknown shape type: ${type}`);
  }
}
