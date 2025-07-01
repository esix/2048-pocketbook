import Tile from "./tile";
import { type ICells, type IGridState, IPosition, type IRow, ITileState } from "./local_storage_manager";

export default class Grid {
  public size_x: number;
  public size_y: number;
  public cells: (Tile | null)[][];

  public constructor(size_x: number, size_y: number, previousState?: ICells) {
    this.size_x = size_x;
    this.size_y = size_y;
    this.cells = previousState ? this.fromState(previousState) : this.empty();
  }

  // Build a grid of the specified size
  private empty(): (Tile | null)[][] {
    const cells: (Tile | null)[][] = [];

    for (let x = 0; x < this.size_x; x++) {
      const row: (Tile | null)[] = [];

      for (let y = 0; y < this.size_y; y++) {
        row.push(null);
      }

      cells[x] = row;
    }

    return cells;
  }

  private fromState(state: ICells): (Tile | null)[][] {
    const cells: (Tile | null)[][] = [];

    for (let x = 0; x < this.size_x; x++) {
      const row: (Tile | null)[] = [];

      for (let y = 0; y < this.size_y; y++) {
        const tile: ITileState | null = state[x][y];
        row.push(tile ? new Tile(tile.position, tile.value) : null);
      }

      cells[x] = row;
    }

    return cells;
  }

  // Find the first available random position
  public randomAvailableCell(): IPosition | null {
    const cells: IPosition[] = this.availableCells();

    if (cells.length) {
      return cells[Math.floor(Math.random() * cells.length)];
    }

    return null;
  }

  private availableCells(): IPosition[] {
    const cells: IPosition[] = [];

    this.eachCell((x: number, y: number, tile: Tile | null) => {
      if (!tile) {
        cells.push({x: x, y: y});
      }
    });

    return cells;
  }

  // Call callback for every cell
  public eachCell(callback: (x: number, y: number, tile: Tile | null) => void) {
    for (let x = 0; x < this.size_x; x++) {
      for (let y = 0; y < this.size_y; y++) {
        callback(x, y, this.cells[x][y]);
      }
    }
  }

  // Check if there are any cells available
  public cellsAvailable(): boolean {
    return !!this.availableCells().length;
  }

  // Check if the specified cell is taken
  public cellAvailable(cell: IPosition): boolean {
    return !this.cellOccupied(cell);
  }

  private cellOccupied(cell: IPosition): boolean {
    return !!this.cellContent(cell);
  }

  public cellContent(cell: IPosition): Tile | null {
    if (this.withinBounds(cell)) {
      return this.cells[cell.x][cell.y];
    } else {
      return null;
    }
  }

  // Inserts a tile at its position
  public insertTile(tile: Tile): void {
    this.cells[tile.x][tile.y] = tile;
  }

  public removeTile(tile: Tile): void {
    this.cells[tile.x][tile.y] = null;
  }

  public withinBounds(position: IPosition): boolean {
    return position.x >= 0 && position.x < this.size_x &&
      position.y >= 0 && position.y < this.size_y;
  }

  public serialize(): IGridState {
    const cellState: ICells = [];

    for (let x = 0; x < this.size_x; x++) {
      const row: IRow = cellState[x] = [];

      for (let y = 0; y < this.size_y; y++) {
        const cell: Tile | null = this.cells[x][y];
        row.push(cell !== null ? cell.serialize() : null);
      }
    }

    return {
      size_x: this.size_x,
      size_y: this.size_y,
      cells: cellState
    };
  }
}
