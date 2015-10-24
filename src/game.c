/* game.c - 2048 game logic implementation

   Copyright © 2015 Evgeny Pervushin <your@address>
   This work is free. You can redistribute it and/or modify it under the
   terms of the Do What The Fuck You Want To Public License, Version 2,
   as published by Sam Hocevar. See the COPYING file for more details. */

#include "game.h"
#include <stdlib.h>
#include <assert.h>


struct Game
{
  unsigned int rows;
  unsigned int cols;
  unsigned char *field;
};


typedef struct Position
{
  unsigned int row;
  unsigned int col;
} position_t;


void game_set (game_t *game, unsigned int row, unsigned int col, unsigned char value);
unsigned int game_get_cells_available (game_t *game);
char game_get_random_position (game_t *game, position_t *pos);
char game_add_random_tile (game_t *game);
char game_in_bounds (game_t *game, unsigned int row, unsigned int col);
int game_fall_piece (game_t *game, unsigned int row, unsigned int col, int dr, int dc);


game_t*
game_init (unsigned int rows, unsigned int cols)
{
  struct Game *game;

  game = malloc(sizeof(struct Game));
  if (!game)
    {
      goto fail;
    }

  game->rows = rows;
  game->cols = cols;
  game->field = malloc (sizeof(char) * game->rows * game->cols);
  if (!game->field)
    {
      goto fail;
    }

  return game;

fail:
  if (game && game->field)
    {
      free (game->field);
      game->field = NULL;
    }

  if (game)
    {
      free (game);
      game = NULL;
    }

  return NULL;
}


void
game_new (game_t* game)
{
  int i, j;

  for (i = 0; i < game->rows; ++i)
    {
      for (j = 0; j < game->cols; ++j)
        {
            game_set (game, i, j, 0);
        }
    }

  game_set (game, 3, 0, 1);
  game_set (game, 3, 1, 1);
  game_set (game, 3, 2, 2);
  //game_add_random_tile (game);
  //game_add_random_tile (game);
}


unsigned char
game_get (game_t *game, unsigned int row, unsigned int col)
{
  assert(row < game->rows && col < game->cols);
  if (!(row < game->rows && col < game->cols))
    {
      return 0;
    }
  return game->field[row * game->cols + col];
}


char
game_move (game_t *game, enum GameDirection direction )
{
  int i, j;
  int num_falls;

  num_falls = 0;

  switch(direction)
    {
    case E_GAME_RIGHT:
      for (i = 0; i < game->rows; ++i)
        {
          for (j = game->cols - 1; j >= 0; --j)
            {
              num_falls += game_fall_piece (game, i, j, 0, 1);
            }
        }
      break;

    case E_GAME_UP:
      for (i = 0; i < game->rows; ++i)
        {
          for (j = 0; j < game->cols; ++j)
            {
              num_falls += game_fall_piece (game, i, j, -1, 0);
            }
        }
      break;

    case E_GAME_LEFT:
      for (i = 0; i < game->rows; ++i)
        {
          for (j = 0; j < game->cols; ++j)
            {
              num_falls += game_fall_piece (game, i, j, 0, -1);
            }
        }
      break;

    case E_GAME_DOWN:
      for (i = game->rows- 1 ; i >= 0; --i)
        {
          for (j = 0; j < game->cols; ++j)
            {
              num_falls += game_fall_piece (game, i, j, 1, 0);
            }
        }
      break;
  }

  if (num_falls)
    {
      return game_add_random_tile(game);
    }
  else
    {
      return 0;
    }
}


void
game_set (game_t *game, unsigned int row, unsigned int col, unsigned char value)
{
  assert(row < game->rows && col < game->cols);
  if (!(row < game->rows && col < game->cols))
    {
      return;
    }
  game->field[row * game->cols + col] = value;
}


unsigned int
game_get_cells_available (game_t *game)
{
  unsigned int result, i, j;

  result = 0;

  for (i = 0; i < game->rows; ++i)
    {
      for (j = 0; j < game->cols; ++j)
        {
          if (game_get (game, i, j) == 0)
            {
                ++result;
            }
        }
    }

  return result;
}


char
game_get_random_position (game_t *game, position_t *pos)
{
  unsigned int cells_available, cell, i, j;

  cells_available = game_get_cells_available (game);
  if (!cells_available)
    {
      return 0;
    }

  cell = rand () % cells_available;              // random cell index

  for (i = 0; i < game->rows; ++i)
    {
      for (j = 0; j < game->cols; ++j)
        {
          if (!game_get (game, i, j) && !cell--)
            {
                pos->row = i;
                pos->col = j;
                return 1;
            }
        }
    }

  return 0;
}


char
game_add_random_tile (game_t *game)
{
  position_t pos;

  if (game_get_random_position (game, &pos))
    {
      int value = (rand() % 10) < 9 ? 1 : 2;
      game_set (game, pos.row, pos.col, value);
      return 1;
    }
  else
    {
      return 0;
    }
}


char
game_in_bounds (game_t *game, unsigned int row, unsigned int col)
{
  return (0 <= row) && (row <= game->rows) &&
         (0 <= col) && (col <= game->cols);
}


int
game_fall_piece (game_t *game, unsigned int row, unsigned int col, int dr, int dc)
{
  unsigned int new_row, new_col;
  char v;

  v = game_get (game, row, col);
  if (v == 0)
    {
      return 0;
    }

  new_row = row;
  new_col = col;

  while (game_in_bounds (game, new_row + dr, new_col + dc) &&
         game_get (game, new_row + dr, new_col + dc) == 0)
    {
      new_row += dr;
      new_col += dc;
    }

  if (game_in_bounds (game, new_row + dr, new_col + dc) &&
      game_get (game, new_row + dr, new_col + dc) == v)          // join
    {
      new_row += dr;
      new_col += dc;
      ++v;
    }

  if (new_row != row || new_col != col)
    {
      game_set (game, row, col, 0);
      game_set (game, new_row, new_col, v);
      return 1;
    }
  else
    {
      return 0;
    }
}
