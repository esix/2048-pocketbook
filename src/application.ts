import GameManager from "./game_manager";


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


function main() {
  (window as any).app = new GameManager(4);
}

main();
