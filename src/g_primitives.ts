import {_getCtx} from "./inkview";


export function round_rect(x: number, y: number, w: number, h: number, radius: number, color: number) {
  const ctx = _getCtx();
  ctx.beginPath();
  ctx.fillStyle = '#' + (color).toString(16).padStart(6, '0');
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}


export function button(x: number, y: number, w: number, h: number, text: string) {
  const ctx = _getCtx();

  round_rect(x, y, w, h, 2, 0x008f7a66);
  ctx.font = `bold ${Math.floor(Math.min(w, h) / 3)}px Arial`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = "center";
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + (w >> 1), y + (h >> 1), w);
}


export function c_text(text: string, x: number, y: number, fontSize: number, color: number) {
  const ctx = _getCtx();
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = '#' + (color).toString(16).padStart(6, '0');;
  ctx.textAlign = "center";
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}
