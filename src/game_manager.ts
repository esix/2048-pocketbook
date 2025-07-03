import Grid from "./grid";
import Tile from "./tile";
import HTMLActuator from "./actuator";
import KeyboardInputManager, { IDirection } from "./keyboard_input_manager";
import LocalStorageManager, { IGameState, IPosition } from "./local_storage_manager";


// const SCORE_TO_WIN = 2048;
const SCORE_TO_WIN = 16;

interface ITraversal {
  x: number[];
  y: number[];
}

interface IFarthestPosition {
  farthest: IPosition;
  next: IPosition;
}


function has_winner_tile(grid: Grid): boolean {
  for (let i = 0; i < grid.size_y; i++) {
    for (let j = 0; j < grid.size_x; j++) {
      const tile = grid.cells[j][i];
      if (tile !== null && tile.value >= SCORE_TO_WIN) {
        return true;
      }
    }
  }
  return false;
}

export default class GameManager {
  // Size of the grid
  private size_x: number;
  private size_y: number;
  private inputManager: KeyboardInputManager;
  private storageManager: LocalStorageManager;
  private actuator: HTMLActuator;
  private startTiles: number;
  private _keepPlaying: boolean;
  private over: boolean;
  private grid: Grid;
  private score: number;
  private won: boolean;

  public constructor(size_x: number, size_y: number) {
    this.size_x = size_x; // Size of the grid
    this.size_y = size_y; // Size of the grid
    this.inputManager = new KeyboardInputManager();
    this.storageManager = new LocalStorageManager();
    this.actuator = new HTMLActuator();

    this.startTiles = 2;

    this.inputManager.on('move', this.move);
    this.inputManager.on('restart', this.restart);
    this.inputManager.on('keepPlaying', this.keepPlaying);

    this.setup();
  }

  // Restart the game
  private restart = () => {
    this.storageManager.clearGameState();
    this.actuator.continueGame(); // Clear the game won/lost message
    this.setup();
  }

  // Keep playing after winning (allows going over 2048)
  private keepPlaying = () => {
    this._keepPlaying = true;
    this.actuator.continueGame(); // Clear the game won/lost message
  }

  // Return true if the game is lost, or has won and the user hasn't kept playing
  private isGameTerminated() {
    return this.over || (this.won && !this._keepPlaying);
  }

  // Set up the game
  private setup(): void {
    const previousState: IGameState | null = this.storageManager.getGameState();

    // Reload the game from a previous game if present
    if (previousState && previousState.grid.size_x === this.size_x && previousState.grid.size_y === this.size_y) {
      this.grid = new Grid(previousState.grid.size_x, previousState.grid.size_y, previousState.grid.cells); // Reload grid
      this.score = previousState.score;
      this.over = previousState.over;
      this.won = previousState.won;
      this._keepPlaying = previousState.keepPlaying;
    } else {
      this.grid = new Grid(this.size_x, this.size_y);
      this.score = 0;
      this.over = false;
      this.won = false;
      this._keepPlaying = false;

      // Add the initial tiles
      this.addStartTiles();
    }

    // Update the actuator
    this.actuate();
  }

  // Set up the initial tiles to start the game with
  private addStartTiles(): void {
    for (let i = 0; i < this.startTiles; i++) {
      this.addRandomTile();
    }
  }

  // Adds a tile in a random position
  private addRandomTile(): void {
    if (this.grid.cellsAvailable()) {
      const value = Math.random() < 0.9 ? 2 : 4;
      const tile: Tile = new Tile(this.grid.randomAvailableCell()!, value);
      tile.is_new = true;
      this.grid.insertTile(tile);
    }
  }

  // Sends the updated grid to the actuator
  private actuate() {
    if (this.storageManager.getBestScore() < this.score) {
      this.storageManager.setBestScore(this.score);
    }

    // Clear the state when the game is over (game over only, not win)
    if (this.over) {
      this.storageManager.clearGameState();
    } else {
      this.storageManager.setGameState(this.serialize());
    }

    this.actuator.actuate(
      this.grid,
      {
        score: this.score,
        over: this.over,
        won: this.won,
        bestScore: this.storageManager.getBestScore(),
        terminated: this.isGameTerminated()
      });
  }

  // Move a tile and its representation
  private moveTile(tile: Tile, position: IPosition) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[position.x][position.y] = tile;
    tile.updatePosition(position);
  };

  // Move tiles on the grid in the specified direction
  private move = (direction: IDirection): void => {
    // 0: up, 1: right, 2: down, 3: left
    if (this.isGameTerminated()) return; // Don't do anything if the game's over

    let tile: Tile | null = null;
    const vector: IPosition = this.getVector(direction);
    const traversals: ITraversal = this.buildTraversals(vector);
    let moved = false;

    // Save the current tile positions and remove merger information
    this.grid.eachCell((x: number, y: number, tile: Tile)=> {
      if (tile) {
        tile.resetMovement();
        tile.savePosition();
      }
    });

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach((x: number)=> {
      traversals.y.forEach((y: number)=> {
        const cell: IPosition = {x: x, y: y};
        tile = this.grid.cellContent(cell);

        if (tile) {
          const positions: IFarthestPosition = this.findFarthestPosition(cell, vector);
          const next: Tile | null = this.grid.cellContent(positions.next);

          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            const merged: Tile = new Tile(positions.next, tile.value * 2);

            if (next.previousPosition) {                              // tile which we merge to, was moved on previous traversal - restore it position
              next.x = next.previousPosition.x;
              next.y = next.previousPosition.y;
              next.previousPosition = null;
            }

            merged.mergedFrom = [tile, next];
            merged.is_new = true;

            this.grid.removeTile(next);
            this.grid.removeTile(tile);
            this.grid.insertTile(merged);

            // Converge the two tiles' positions
            // tile.updatePosition(positions.next);

            // Update the score
            this.score += merged.value;

            moved = true;
          } else {
            this.moveTile(tile, positions.farthest);
            if (!this.positionsEqual(cell, tile)) {
              moved = true; // The tile moved from its original cell!
            }
          }
        }
      });
    });

    if (!moved) return;

    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
      this.actuator.game_over();
    } else if (!this.won && has_winner_tile(this.grid)) {
      this.won = true;
      this.actuator.win();
    }


    this.actuator.moveStarted();
    this.actuate();
  }

  // Get the vector representing the chosen direction
  private getVector(direction: IDirection): IPosition {
    // Vectors representing tile movement
    const map: { [key: number]: IPosition } = {
      0: {x: 0, y: -1}, // Up
      1: {x: 1, y: 0},  // Right
      2: {x: 0, y: 1},  // Down
      3: {x: -1, y: 0}   // Left
    };

    return map[direction];
  }

  // Build a list of positions to traverse in the right order
  private buildTraversals(vector: IPosition): ITraversal {
    const traversals: ITraversal = {x: [], y: []};

    for (let pos = 0; pos < this.size_x; pos++) traversals.x.push(pos);
    for (let pos = 0; pos < this.size_y; pos++) traversals.y.push(pos);

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  private findFarthestPosition(cell: IPosition, vector: IPosition): IFarthestPosition {
    let previous: IPosition;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell = {x: previous.x + vector.x, y: previous.y + vector.y};
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell // Used to check if a merge is required
    };
  }

  private movesAvailable(): boolean {
    return this.grid.cellsAvailable() || this.tileMatchesAvailable();
  }

  // Check for available matches between tiles (more expensive check)
  private tileMatchesAvailable(): boolean {
    let tile: Tile | null = null;

    for (let x = 0; x < this.size_x; x++) {
      for (let y = 0; y < this.size_y; y++) {
        tile = this.grid.cellContent({x: x, y: y});

        if (tile) {
          for (let direction: IDirection = 0; direction < 4; direction++) {
            const vector: IPosition = this.getVector(direction as IDirection);
            const cell: IPosition = {x: x + vector.x, y: y + vector.y};

            const other: Tile | null = this.grid.cellContent(cell);

            if (other && other.value === tile.value) {
              return true; // These two tiles can be merged
            }
          }
        }
      }
    }

    return false;
  }

  private positionsEqual(first: IPosition, second: IPosition): boolean {
    return first.x === second.x && first.y === second.y;
  }

  // Represent the current game as an object
  private serialize(): IGameState {
    return {
      grid: this.grid.serialize(),
      score: this.score,
      over: this.over,
      won: this.won,
      keepPlaying: this._keepPlaying,
    };
  }
}
