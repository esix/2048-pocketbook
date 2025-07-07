import { IPosition } from "./local_storage_manager";
import Grid from "./grid";
import Tile from "./tile";


const COLOR_2 = '#776e65';
const BG_COLOR_2 = '#eee4da';

const COLOR_4 = '#776e65';
const BG_COLOR_4 = '#ede0c8';

const COLOR_8 = '#f9f6f2';
const BG_COLOR_8 = '#f2b179';

const COLOR_16 = '#f9f6f2';
const BG_COLOR_16 = '#f59563';

const COLOR_32 = '#f9f6f2';
const BG_COLOR_32 = '#f67c5f';

const COLOR_64 = '#f9f6f2';
const BG_COLOR_64 = '#f65e3b';

const COLOR_128 = '#f9f6f2';
const BG_COLOR_128 = '#edcf72';      // font-size: 45px;

const COLOR_256 = '#f9f6f2';
const BG_COLOR_256 = '#edcc61';      // font-size: 45px;

const COLOR_512 = '#f9f6f2';
const BG_COLOR_512 = '#edc850';      // font-size: 45px;

const COLOR_1024 = '#f9f6f2';
const BG_COLOR_1024 = '#edc53f';      // font-size: 35px;

const COLOR_2048 = '#f9f6f2';
const BG_COLOR_2048 = '#edc22e';      // font-size: 35px;

const COLOR_SUPER = '#f9f6f2';
const BG_COLOR_SUPER = '#3c3a32';      // font-size: 30px;

const BG_COLOR_EMPTY =  '#CDC0B5';


const ANIMATION_INTERVAL = 100;


function getTileColor(value: number) {
  let textColor: string, tileColor: string;
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

interface IActuateMetadata {
  score: number;
  over: boolean;
  won: boolean;
  bestScore: number;
  terminated: boolean;
}


const MESSAGE_WIN = 1;
const MESSAGE_LOST = 2;

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

  public win() {
    this.message(true); // You win!
  }

  public game_over() {
    this.message(false); // You lose
  }

  public actuate(grid: Grid, metadata: IActuateMetadata): void {
    this._grid = grid;
    this._metadata = metadata;
  }

  // Continues the game (both restart and keep playing)
  public continueGame(): void {
    this._message = 0;
    this.clearMessage();
  };


  private _tick(grid: Grid, metadata: IActuateMetadata) {
    this.updateScore(metadata.score);
    this.updateBestScore(metadata.bestScore);

    const board: HTMLCanvasElement = document.getElementById("board")! as HTMLCanvasElement;
    const w = board.width;
    const h = board.height;
    const ctx = board.getContext("2d")!;
    const now = Date.now();

    const render_grid = (x: number, y: number, w: number, h: number)=>  {
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

      {
        ctx.beginPath();
        ctx.fillStyle = '#bbada0';
        ctx.roundRect(x, y, w, h, Math.round(cell_size / 20));
        ctx.fill();
      }

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
          ctx.beginPath();
          ctx.fillStyle = BG_COLOR_EMPTY;
          const {x, y, w, h} = getCellScreenCoords(i, j);
          ctx.roundRect(x, y, w, h, Math.round(cell_size / 20));
          ctx.fill();
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

              ctx.beginPath();
              ctx.fillStyle = tileColor;
              ctx.roundRect(rect_x, rect_y, ss, ss, Math.round(ss / 20));
              ctx.fill();

              ctx.font = `bold ${Math.floor(ss / 2)}px Arial`;
              ctx.fillStyle = textColor;
              ctx.textAlign = "center";
              ctx.textBaseline = 'middle';
              ctx.fillText(String(value), cx, cy, ss);
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



    render_grid(15, 15, w - 30, h - 30);
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
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
  }
}
