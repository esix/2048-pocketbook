
export const EVT_INIT = 21;
export const EVT_EXIT = 22;
export const EVT_SHOW = 23;
export const EVT_REPAINT = 23;
export const EVT_HIDE = 24;
export const EVT_KEYDOWN = 25;
export const EVT_KEYPRESS = 25;
export const EVT_KEYUP = 26;
export const EVT_KEYRELEASE = 26;
export const EVT_KEYREPEAT = 28;
export const EVT_POINTERUP = 29;
export const EVT_POINTERDOWN = 30;
export const EVT_POINTERMOVE = 31;
export const EVT_POINTERLONG = 34;
export const EVT_POINTERHOLD = 35;
export const EVT_ORIENTATION = 32;


let board: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export function _getCtx(): CanvasRenderingContext2D {
  return ctx;
}


export function InkViewMain(handler: (type: number,  par1: number, par2: number) => number) {
  board = document.getElementById("board")! as HTMLCanvasElement;;
  ctx = board.getContext("2d")!;

  handler(EVT_INIT, 0, 0);
}

// Graphic functions. Color=0x00RRGGBB

export function ClearScreen(): void {

}

// void SetClip(int x, int y, int w, int h);
// void DrawPixel(int x, int y, int color);
// void DrawLine(int x1, int y1, int x2, int y2,int color);
// void DrawRect(int x, int y, int w, int h, int color);
// void FillArea(int x, int y, int w, int h, int color);
// void InvertArea(int x, int y, int w, int h);
// void InvertAreaBW(int x, int y, int w, int h);
// void DimArea(int x, int y, int w, int h, int color);
// void DrawSelection(int x, int y, int w, int h, int color);
// void DitherArea(int x, int y, int w, int h, int levels, int method);
// void Stretch(const unsigned char *src, int format, int sw, int sh, int scanline, int dx, int dy, int dw, int dh, int rotate);
// void SetCanvas(icanvas *c);
// icanvas *GetCanvas();
// void Repaint();




export function ScreenWidth() {
  return board.width;
}

export function ScreenHeight() {
  return board.height;
}
