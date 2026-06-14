import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import { commandExecutor } from '../core/commandExecutor';

export function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: '#fafafa',
      borderColor: '#ddd',
      borderWidth: 2,
    });

    commandExecutor.init(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div className="canvas-board">
      <canvas ref={canvasRef} className="canvas" />
    </div>
  );
}
