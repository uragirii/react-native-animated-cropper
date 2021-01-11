import {CanvasRenderingContext2D} from 'react-native-canvas';

export type BasicRect = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

const UNSELECT_COLOR = 'rgba(0,0,0,0.5)';
const THRESHOLD = 7;

export const drawUnselectRectangle = (
  {x0, y0, x1, y1}: BasicRect,
  _ctx: CanvasRenderingContext2D,
) => {
  _ctx.fillStyle = UNSELECT_COLOR;
  const x = Math.min(x0, x1);
  const y = Math.min(y0, y1);
  const width = Math.abs(x0 - x1);
  const height = Math.abs(y0 - y1);
  _ctx.fillRect(x, y, width, height);
};

const drawCircle = (
  x: number,
  y: number,
  radius: number,
  _ctx: CanvasRenderingContext2D,
) => {
  _ctx.fillStyle = '#5650F8';
  _ctx.beginPath();
  _ctx.arc(x, y, radius, 0, 2 * Math.PI);
  _ctx.fill();
  _ctx.strokeStyle = 'rgba(255,255,255,1)';
  _ctx.lineWidth = 2;
  _ctx.beginPath();
  _ctx.arc(x, y, radius, 0, 2 * Math.PI);
  _ctx.stroke();
};

const drawCircles = (
  MAIN_RECTANGLE: BasicRect,
  ctx: CanvasRenderingContext2D,
) => {
  const x0 = Math.min(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);
  const x1 = Math.max(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);

  const y0 = Math.min(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);
  const y1 = Math.max(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);

  const trX = x1;
  const trY = y0;

  const blX = x0;
  const blY = y1;
  drawCircle(x0, y0, THRESHOLD, ctx);
  drawCircle(x1, y1, THRESHOLD, ctx);
  drawCircle(trX, trY, THRESHOLD, ctx);
  drawCircle(blX, blY, THRESHOLD, ctx);
};

export const redrawCanvas = (
  _ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  MAIN_RECTANGLE: BasicRect,
) => {
  const width = canvasW;
  const height = canvasH;
  _ctx.clearRect(0, 0, width, height);

  // After drawing selection rectangle draw the unselect rectangles
  const x0 = Math.min(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);
  const y0 = Math.min(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);
  const x1 = Math.max(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);
  const y1 = Math.max(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);

  const unselectR1 = {
    x0: 0,
    x1: canvasW,
    y0: 0,
    y1: y0,
  };
  const unselectR2 = {
    x0: 0,
    x1: x0,
    y0: y0,
    y1: canvasH,
  };
  const unselectR3 = {
    x0: x0,
    x1: canvasW,
    y0: y1,
    y1: canvasH,
  };
  const unselectR4 = {
    x0: x1,
    x1: canvasW,
    y0: y0,
    y1: y1,
  };
  // drawRectangleOnCanvas(MAIN_RECTANGLE, _ctx)
  // drawImage(_ctx);
  drawUnselectRectangle(unselectR1, _ctx);
  drawUnselectRectangle(unselectR2, _ctx);
  drawUnselectRectangle(unselectR3, _ctx);
  drawUnselectRectangle(unselectR4, _ctx);
  drawCircles(MAIN_RECTANGLE, _ctx);
};

export const isInsideRectangle = (
  x: number,
  y: number,
  MAIN_RECTANGLE: BasicRect,
): boolean => {
  const x0 = Math.min(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1) + THRESHOLD;
  const x1 = Math.max(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1) - THRESHOLD;
  const y0 = Math.min(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1) + THRESHOLD;
  const y1 = Math.max(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1) - THRESHOLD;

  return x > x0 && x < x1 && y > y0 && y < y1;
};

export const isOutsideRectangle = (
  x: number,
  y: number,
  MAIN_RECTANGLE: BasicRect,
) => {
  const x0 = Math.min(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1) - THRESHOLD;
  const x1 = Math.max(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1) + THRESHOLD;
  const y0 = Math.min(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1) - THRESHOLD;
  const y1 = Math.max(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1) + THRESHOLD;

  return !(x > x0 && x < x1 && y > y0 && y < y1);
};

export const isOnVertex = (x: number, y: number, MAIN_RECTANGLE: BasicRect) => {
  const x0 = Math.min(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);
  const x1 = Math.max(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);

  const y0 = Math.min(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);
  const y1 = Math.max(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);

  const trX = x1;
  const trY = y0;

  const blX = x0;
  const blY = y1;

  if (
    x >= x0 - THRESHOLD &&
    x <= x0 + THRESHOLD &&
    y >= y0 - THRESHOLD &&
    y <= y0 + THRESHOLD
  ) {
    return 'TL';
  } else if (
    x >= trX - THRESHOLD &&
    x <= trX + THRESHOLD &&
    y >= trY - THRESHOLD &&
    y <= trY + THRESHOLD
  ) {
    return 'TR';
  } else if (
    x >= x1 - THRESHOLD &&
    x <= x1 + THRESHOLD &&
    y >= y1 - THRESHOLD &&
    y <= y1 + THRESHOLD
  ) {
    return 'BR';
  } else if (
    x >= blX - THRESHOLD &&
    x <= blX + THRESHOLD &&
    y >= blY - THRESHOLD &&
    y <= blY + THRESHOLD
  ) {
    return 'BL';
  } else {
    return null;
  }
};

export const isOnEdge = (x: number, y: number, MAIN_RECTANGLE: BasicRect) => {
  const x0 = Math.min(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);
  const x1 = Math.max(MAIN_RECTANGLE.x0, MAIN_RECTANGLE.x1);

  const y0 = Math.min(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);
  const y1 = Math.max(MAIN_RECTANGLE.y0, MAIN_RECTANGLE.y1);

  const trX = x1;

  const blX = x0;
  const blY = y1;

  if (
    x >= x0 + THRESHOLD &&
    x <= trX - THRESHOLD &&
    y >= y0 - THRESHOLD &&
    y <= y0 + THRESHOLD
  ) {
    return 'T';
  } else if (
    x >= trX - THRESHOLD &&
    x <= x1 + THRESHOLD &&
    y >= y0 + THRESHOLD &&
    y <= y1 - THRESHOLD
  ) {
    return 'R';
  } else if (
    x >= blX + THRESHOLD &&
    x <= x1 - THRESHOLD &&
    y >= blY - THRESHOLD &&
    y <= y1 + THRESHOLD
  ) {
    return 'B';
  } else if (
    x >= x0 - THRESHOLD &&
    x <= blX + THRESHOLD &&
    y >= y0 + THRESHOLD &&
    y <= y1 - THRESHOLD
  ) {
    return 'L';
  } else {
    return null;
  }
};
