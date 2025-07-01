export interface IPosition {
  x: number;
  y: number;
}

export interface ITileState {
  position: IPosition;
  value: number;
}

export type IRow = (ITileState | null)[];
export type ICells = IRow[];

export interface IGridState {
  size_x: number;
  size_y: number;
  cells: ICells;
}

export interface IGameState {
  grid: IGridState;
  score: number;
  over: boolean;
  won: boolean;
  keepPlaying: boolean;
}


export default class LocalStorageManager {
  private bestScoreKey: string;
  private gameStateKey: string;
  private storage: Storage;

  public constructor() {
    this.bestScoreKey = "bestScore";
    this.gameStateKey = "gameState";
    this.storage = window.localStorage;
  }

  // Best score getters/setters
  public getBestScore() {
    return +this.storage.getItem(this.bestScoreKey)! || 0;
  }

  public setBestScore(score: number): void {
    this.storage.setItem(this.bestScoreKey, String(score));
  }

  // Game state getters/setters and clearing
  public getGameState(): IGameState | null {
    const stateJSON = this.storage.getItem(this.gameStateKey);
    return stateJSON ? JSON.parse(stateJSON) : null;
  }

  public setGameState(gameState: IGameState): void {
    this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
  }

  public clearGameState(): void {
    this.storage.removeItem(this.gameStateKey);
  }
}
