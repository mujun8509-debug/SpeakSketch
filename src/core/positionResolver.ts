export interface Position {
  x: number;
  y: number;
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
  const cols = 4;
  const rows = 3;
  const cellWidth = canvasWidth / cols;
  const cellHeight = canvasHeight / rows;
  
  const col = shapeIndex % cols;
  const row = Math.floor(shapeIndex / cols);
  
  shapeIndex = (shapeIndex + 1) % (cols * rows);
  
  return {
    x: cellWidth * col + cellWidth / 2,
    y: cellHeight * row + cellHeight / 2,
  };
}

export function resetPositionIndex(): void {
  shapeIndex = 0;
}
