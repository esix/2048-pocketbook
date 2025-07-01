import GameManager from "./game_manager";
import { EVT_EXIT, EVT_INIT, InkViewMain } from "./inkview";

let app: GameManager;

function main_handler(type: number,  par1: number, par2: number): number {
  // static app:  * mess = 0;

  switch (type) {
    case EVT_INIT:
      (window as any).app = app = new GameManager(4, 2);
      return 1;
    case EVT_EXIT:
      // delete app;
      return 1;
  }

  return 0;
}


function main() {
  InkViewMain(main_handler);
}

main();
