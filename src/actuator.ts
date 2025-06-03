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

interface IActuateMetadata {
  score: number;
  over: boolean;
  won: boolean;
  bestScore: number;
  terminated: boolean;
}


export default class HTMLActuator {
  private tileContainer: HTMLDivElement;
  private scoreContainer: HTMLDivElement;
  private bestContainer: HTMLDivElement;
  private messageContainer: HTMLDivElement;
  private score: number;
  private moveStartTime: number = 0;
  private _grid: Grid;
  private _metadata: IActuateMetadata;

  public constructor() {
    this.tileContainer = document.querySelector(".tile-container")!;
    this.scoreContainer = document.querySelector(".score-container")!;
    this.bestContainer = document.querySelector(".best-container")!;
    this.messageContainer = document.querySelector(".game-message")!;

    this.score = 0;

    const rerender = () => {
      if (this._grid && this._metadata) {
        this._render(this._grid, this._metadata);
      }
      window.requestAnimationFrame(rerender);
    };
    rerender();
  }

  public moveStarted() {
    this.moveStartTime = Date.now();
  }

  public actuate(grid: Grid, metadata: IActuateMetadata): void {
    this._grid = grid;
    this._metadata = metadata;

    window.requestAnimationFrame(() => {
      this.clearContainer(this.tileContainer);

      grid.cells.forEach((column: (Tile | null)[]) => {
        column.forEach((cell: Tile | null) => {
          if (cell) {
            this.addTile(cell);
          }
        });
      });

      this.updateScore(metadata.score);
      this.updateBestScore(metadata.bestScore);

      if (metadata.terminated) {
        if (metadata.over) {
          this.message(false); // You lose
        } else if (metadata.won) {
          this.message(true); // You win!
        }
      }
    });
  }

  // Continues the game (both restart and keep playing)
  public continueGame(): void {
    this.clearMessage();
  };


  private _render(grid: Grid, metadata: IActuateMetadata) {
    const board: HTMLCanvasElement = document.getElementById("board")! as HTMLCanvasElement;
    const w = board.offsetWidth;
    const h = board.offsetHeight;
    board.width = w;
    board.height = w;
    const ctx = board.getContext("2d")!;
    const now = Date.now();

    const render_grid = (x: number, y: number, size: number)=>  {
      const gap = Math.floor(size / (grid.size * 8 - 1)), s = gap * 7;

      for (let j = 0; j < grid.size; j++) {
        for (let i = 0; i < grid.size; i++) {
          ctx.beginPath();
          ctx.fillStyle = BG_COLOR_EMPTY;
          ctx.roundRect(x + j * (s + gap), y + i * (s + gap), s, s, Math.round(s / 20));
          ctx.fill();
        }
      }

      for (let j = 0; j < grid.size; j++) {
        for (let i = 0; i < grid.size; i++) {
          let tile = grid.cells[j][i];
          if (tile) {
            let tileColor: string, textColor: string;
            switch (tile.value) {
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
            const timeSinceLastMove = now - this.moveStartTime;
            const animate = (from: number, to: number, delta: number) =>
              delta < 1 ? from * (1 - delta) + to * delta : to;

            const ii = tile.previousPosition ? animate(tile.previousPosition.y, i, timeSinceLastMove / 1000) :  i;
            const jj = tile.previousPosition ? animate(tile.previousPosition.x, j, timeSinceLastMove / 1000) :  j;

            ctx.beginPath();
            ctx.fillStyle = tileColor;
            ctx.roundRect(x + jj * (s + gap), y + ii * (s + gap), s, s, Math.round(s / 20));
            ctx.fill();

            ctx.font = `bold ${Math.floor(s / 2)}px Arial`;
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            ctx.fillText(String(tile.value), x + jj * (s + gap) + Math.floor(s / 2), y + ii * (s + gap) + Math.floor(s / 2), s);

          } 
        }
      }
    }

    render_grid(0, 0, Math.min(w, h));
  }


  private clearContainer(container: HTMLDivElement) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  private addTile(tile: Tile) {
    const wrapper: HTMLDivElement = document.createElement("div");
    const inner: HTMLDivElement = document.createElement("div");
    const position: IPosition = tile.previousPosition || {x: tile.x, y: tile.y};
    const positionClass = this.positionClass(position);

    // We can't use classlist because it somehow glitches when replacing classes
    const classes = ["tile", "tile-" + tile.value, positionClass];

    if (tile.value > 2048) classes.push("tile-super");

    this.applyClasses(wrapper, classes);

    inner.classList.add("tile-inner");
    inner.textContent = String(tile.value);

    if (tile.previousPosition) {
      // Make sure that the tile gets rendered in the previous position first
      window.requestAnimationFrame(() => {
        classes[2] = this.positionClass({x: tile.x, y: tile.y});
        this.applyClasses(wrapper, classes); // Update the position
      });
    } else if (tile.mergedFrom) {
      classes.push("tile-merged");
      this.applyClasses(wrapper, classes);

      // Render the tiles that merged
      tile.mergedFrom.forEach((merged: Tile) => {
        this.addTile(merged);
      });
    } else {
      classes.push("tile-new");
      this.applyClasses(wrapper, classes);
    }

    // Add the inner part of the tile to the wrapper
    wrapper.appendChild(inner);

    // Put the tile on the board
    this.tileContainer.appendChild(wrapper);
  }

  private applyClasses(element: any, classes: any) {
    element.setAttribute("class", classes.join(" "));
  }

  private normalizePosition(position: IPosition): IPosition {
    return {x: position.x + 1, y: position.y + 1};
  }

  private positionClass(position: IPosition) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
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
