import { IPosition, type ITileState } from "./local_storage_manager";


export default class Tile {
  public x: number;
  public y: number;
  public value: number;
  public previousPosition: IPosition | null;
  public mergedFrom: [Tile, Tile] | null;
  public is_new: boolean;

  public constructor(position: IPosition, value: number) {
    this.x = position.x;
    this.y = position.y;
    this.value = value || 2;
    this.is_new = false;

    this.previousPosition = null;
    this.mergedFrom = null; // Tracks tiles that merged together
  }

  public resetMovement() {
    this.previousPosition = null;
    this.mergedFrom = null;
    this.is_new = false;
  }

  public savePosition(): void {
    // this.previousPosition = {x: this.x, y: this.y};
  }

  public updatePosition(position: IPosition): void {
    if (this.x !== position.x || this.y !== position.y) {
      console.log('MOVING FROM ', {x: this.x, y: this.y}, 'TO', position);
      this.previousPosition = {x: this.x, y: this.y};
      this.x = position.x;
      this.y = position.y;
    }
  }

  public serialize(): ITileState {
    return {
      position: {
        x: this.x,
        y: this.y
      },
      value: this.value,
    };
  }
}
