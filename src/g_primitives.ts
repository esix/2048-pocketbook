import {_getCtx} from "./inkview";


export function round_rect(x: number, y: number, w: number, h: number, radius: number, color: number) {
  const ctx = _getCtx();
  ctx.beginPath();
  ctx.fillStyle = '#' + (color).toString(16).padStart(6, '0');
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}
