
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

export function InkViewMain(handler: (type: number,  par1: number, par2: number) => number) {
  handler(EVT_INIT, 0, 0);
}
