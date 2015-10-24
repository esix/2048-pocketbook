/* game.h - 2048 game logic interface

   Copyright © 2015 Evgeny Pervushin <your@address>
   This work is free. You can redistribute it and/or modify it under the
   terms of the Do What The Fuck You Want To Public License, Version 2,
   as published by Sam Hocevar. See the COPYING file for more details. */

#ifndef GAME_H_
#define GAME_H_

#define COLS  3
#define ROWS  5

typedef struct Game game_t;

enum GameDirection
{
  E_GAME_UP,
  E_GAME_RIGHT,
  E_GAME_DOWN,
  E_GAME_LEFT
};


game_t* game_init(unsigned int rows, unsigned int cols);

void game_new (game_t *game);

unsigned char game_get (game_t *game, unsigned int row, unsigned int col);

char game_move (game_t *game, enum GameDirection direction);

#endif // GAME_H_
