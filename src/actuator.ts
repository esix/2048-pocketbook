import { IPosition } from "./local_storage_manager";
import Grid from "./grid";
import Tile from "./tile";

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

  public constructor() {
    this.tileContainer = document.querySelector(".tile-container")!;
    this.scoreContainer = document.querySelector(".score-container")!;
    this.bestContainer = document.querySelector(".best-container")!;
    this.messageContainer = document.querySelector(".game-message")!;

    this.score = 0;
  }

  public actuate(grid: Grid, metadata: IActuateMetadata): void {
    this._render(grid, metadata);

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

    function render_grid(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
      console.log(grid, metadata);
      const gap = Math.floor(size / (grid.size * 8 - 1)), s = gap * 7;
      for (let j = 0; j < grid.size; j++) {
        for (let i = 0; i < grid.size; i++) {
          ctx.beginPath();

          let tile = grid.cells[j][i];
          if (!tile) {
            ctx.fillStyle = '#CDC0B5';
          } else {
            ctx.fillStyle = "red";
          }


          ctx.rect(x + j * (s + gap), y + i * (s + gap), s, s);
          ctx.fill();

        }
      }
    }

    const board: HTMLCanvasElement = document.getElementById("board")! as HTMLCanvasElement;
    const w = board.offsetWidth;
    const h = board.offsetHeight;
    board.width = w;
    board.height = w;
    const ctx = board.getContext("2d")!;
    render_grid(ctx, 0, 0, Math.min(w, h));
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
