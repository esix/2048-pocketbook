import { IPosition } from "./local_storage_manager";
import Grid from "./grid";
import Tile from "./tile";
import { ScreenHeight, ScreenWidth } from "./inkview";
import { button, c_text, round_rect } from "./g_primitives";
import { MESSAGE_BOX_GAMEOVER, MESSAGE_BOX_WIN } from "./constants";


const COLOR_2 = 0x00776e65;
const BG_COLOR_2 = 0x00eee4da;

const COLOR_4 = 0x00776e65;
const BG_COLOR_4 = 0x00ede0c8;

const COLOR_8 = 0x00f9f6f2;
const BG_COLOR_8 = 0x00f2b179;

const COLOR_16 = 0x00f9f6f2;
const BG_COLOR_16 = 0x00f59563;

const COLOR_32 = 0x00f9f6f2;
const BG_COLOR_32 = 0x00f67c5f;

const COLOR_64 = 0x00f9f6f2;
const BG_COLOR_64 = 0x00f65e3b;

const COLOR_128 = 0x00f9f6f2;
const BG_COLOR_128 = 0x00edcf72;      // font-size: 45px;

const COLOR_256 = 0x00f9f6f2;
const BG_COLOR_256 = 0x00edcc61;      // font-size: 45px;

const COLOR_512 = 0x00f9f6f2;
const BG_COLOR_512 = 0x00edc850;      // font-size: 45px;

const COLOR_1024 = 0x00f9f6f2;
const BG_COLOR_1024 = 0x00edc53f;      // font-size: 35px;

const COLOR_2048 = 0x00f9f6f2;
const BG_COLOR_2048 = 0x00edc22e;      // font-size: 35px;

const COLOR_SUPER = 0x00f9f6f2;
const BG_COLOR_SUPER = 0x003c3a32;      // font-size: 30px;

const BG_COLOR_EMPTY = 0x00CDC0B5;


const ANIMATION_INTERVAL = 100;


function getTileColor(value: number) {
  let textColor: number, tileColor: number;
  switch (value) {
    case 2: textColor = COLOR_2; tileColor = BG_COLOR_2; break;
    case 4: textColor = COLOR_4; tileColor = BG_COLOR_4; break;
    case 8: textColor = COLOR_8; tileColor = BG_COLOR_8; break;
    case 16: textColor = COLOR_16; tileColor = BG_COLOR_16; break;
    case 32: textColor = COLOR_32; tileColor = BG_COLOR_32; break;
    case 64: textColor = COLOR_64; tileColor = BG_COLOR_64; break;
    case 128: textColor = COLOR_128; tileColor = BG_COLOR_128; break;
    case 256: textColor = COLOR_256; tileColor = BG_COLOR_256; break;
    case 512: textColor = COLOR_512; tileColor = BG_COLOR_512; break;
    case 1024: textColor = COLOR_1024; tileColor = BG_COLOR_1024; break;
    case 2048: textColor = COLOR_2048; tileColor = BG_COLOR_2048; break;
    default: textColor = COLOR_SUPER;  tileColor = BG_COLOR_SUPER; break;
  }
  return {textColor, tileColor}
}

function opacify(color: number, grage: number): number {
  //return Math.round(color * grage + 0x00ffffff * (1 - grage));
  let r = (color >> 16) & 0xff;
  let g = (color >> 8) & 0xff;
  let b = (color >> 0) & 0xff;
  r = Math.round(r * grage + 0xff * (1 - grage))
  g = Math.round(g * grage + 0xff * (1 - grage))
  b = Math.round(b * grage + 0xff * (1 - grage))
  return (r << 16) | (g << 8) | (b << 0);
}


interface IActuateMetadata {
  score: number;
  over: boolean;
  won: boolean;
  bestScore: number;
  terminated: boolean;
  message_box: number;
}


export default class HTMLActuator {
  private scoreContainer: HTMLDivElement;
  private bestContainer: HTMLDivElement;
  private messageContainer: HTMLDivElement;
  private score: number;
  private moveStartTime: number = 0;
  private _grid: Grid;
  private _metadata: IActuateMetadata;
  private _message: number;

  public constructor() {
    this.scoreContainer = document.querySelector(".score-container")!;
    this.bestContainer = document.querySelector(".best-container")!;
    this.messageContainer = document.querySelector(".game-message")!;

    this.score = 0;
    this._message = 0;

    const tick = () => {
      if (this._grid && this._metadata) {
        this._tick(this._grid, this._metadata);
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  }

  public moveStarted() {
    this.moveStartTime = Date.now();
  }

  public actuate(grid: Grid, metadata: IActuateMetadata): void {
    this._grid = grid;
    this._metadata = metadata;
  }

  // Continues the game (both restart and keep playing)
  public continueGame(): void {
    debugger;
    this._message = 0;
    this.clearMessage();
  };


  private _tick(grid: Grid, metadata: IActuateMetadata) {
    this.updateScore(metadata.score);
    this.updateBestScore(metadata.bestScore);

    const board: HTMLCanvasElement = document.getElementById("board")! as HTMLCanvasElement;
    const w = ScreenWidth();
    const h = ScreenHeight();

    const ctx = board.getContext("2d")!;
    const now = Date.now();

    const render_grid = (x: number, y: number, w: number, h: number, opacity: number)=>  {
      const gap_w = Math.floor(w / (grid.size_x * 8 + grid.size_x + 1));
      const gap_h = Math.floor(h / (grid.size_y * 8 + grid.size_y + 1));
      const gap = Math.min(gap_w, gap_h);
      const cell_size = gap * 8;

      // update w / h
      const new_w = gap * (grid.size_x * 8 + grid.size_x + 1);
      const new_h = gap * (grid.size_y * 8 + grid.size_y + 1);
      x = x + (w >> 1) - (new_w >> 1);
      y = y + (h >> 1) - (new_h >> 1);
      w = new_w;
      h = new_h;

      round_rect(x, y, w, h, Math.round(cell_size / 20), opacify(0xbbada0, opacity));       // grey

      const getCellScreenCoords = (i: number, j: number) => {
        return {
          x: x + gap + j * (cell_size + gap),
          y: y + gap + i * (cell_size + gap),
          w: cell_size,
          h: cell_size,
        }
      };

      for (let j = 0; j < grid.size_x; j++) {
        for (let i = 0; i < grid.size_y; i++) {
          const {x, y, w, h} = getCellScreenCoords(i, j);
          round_rect(x, y, w, h, Math.round(cell_size / 20), opacify(BG_COLOR_EMPTY, opacity));
        }
      }

      for (let j = 0; j < grid.size_x; j++) {
        for (let i = 0; i < grid.size_y; i++) {
          let tile: Tile | null = grid.cells[j][i];
          if (tile) {
            const timeSinceLastMove = now - this.moveStartTime;
            const animateMoving = 0 <= timeSinceLastMove && timeSinceLastMove < ANIMATION_INTERVAL;
            const animateAppear = ANIMATION_INTERVAL <= timeSinceLastMove && timeSinceLastMove < 2 * ANIMATION_INTERVAL;

            const linear = (from: number, to: number, delta: number) =>
              delta <= 0 ? from : delta >= 1 ? to : from * (1 - delta) + to * delta;


            const renderTileAtCoords = (ii: number, jj: number, ss: number, value: number)=> {
              const {x, y, w, h} = getCellScreenCoords(ii, jj);
              const cx = x + (w >> 1);
              const cy = y + (h >> 1);
              const {tileColor, textColor} = getTileColor(value);
              const rect_x = cx - (ss >> 1);
              const rect_y = cy - (ss >> 1);

              round_rect(rect_x, rect_y, ss, ss, Math.round(ss / 20), opacify(tileColor, opacity));
              c_text(String(value), cx, cy, Math.floor(ss / 2), opacify(textColor, opacity));
            }

            const dt = timeSinceLastMove / ANIMATION_INTERVAL;

            if (tile.mergedFrom && animateMoving) {
              const [t1, t2] = tile.mergedFrom;
              renderTileAtCoords(
                linear(t1.y, tile.y, dt),
                linear(t1.x, tile.x, dt),
                cell_size,
                t1.value);
              renderTileAtCoords(
                linear(t2.y, tile.y, dt),
                linear(t2.x, tile.x, dt),
                cell_size,
                t2.value);

            } else {
              const ii = tile.previousPosition ? linear(tile.previousPosition.y, i, dt) :  i;
              const jj = tile.previousPosition ? linear(tile.previousPosition.x, j, dt) :  j;
              const ss = tile.is_new ? linear(0, cell_size, dt - 1) : cell_size;

              renderTileAtCoords(ii, jj, ss, tile.value);
            }
          }
        }
      }
    }

    render_grid(15, 15, w - 30, h - 30, metadata.message_box ? 0.3 : 1);

    // TODO message coords

    switch (metadata.message_box) {
      case MESSAGE_BOX_WIN:
        this.message(true);
        c_text('You win!', w >> 1, (h >> 4) * 8, Math.floor(Math.min(w, h) / 8.5), 0x00333333);
        button((w >> 4) * 4, (h >> 4) * 11, (w >> 4) * 4, (h >> 5) * 3, 'Keep going');
        button((w >> 4) * 9, (h >> 4) * 11, (w >> 4) * 4, (h >> 5) * 3, 'Try again');
        break;

      case MESSAGE_BOX_GAMEOVER:
        this.message(false);
        break;
    }

  }


  private clearContainer(container: HTMLDivElement) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  private updateScore(score: number) {
    this.clearContainer(this.scoreContainer);

    const difference = score - this.score;
    this.score = score;

    this.scoreContainer.textContent = String(this.score);

    if (difference > 0) {
      const addition: HTMLDivElement = document.createElement("div");
      addition.classList.add("score-addition");
      addition.textContent = "+" + difference;

      this.scoreContainer.appendChild(addition);
    }
  }

  private updateBestScore(bestScore: number): void {
    this.bestContainer.textContent = String(bestScore);
  };

  private message(won: boolean): void {
    const type = won ? "game-won" : "game-over";
    const message = won ? "You win!" : "Game over!";

    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  }

  private clearMessage() {
    // IE only takes one value to remove at a time.
    // this.messageContainer.classList.remove("game-won");
    // this.messageContainer.classList.remove("game-over");
  }
}
