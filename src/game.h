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

void game_set (game_t *game, unsigned int row, unsigned int col, char value);

char game_get (game_t *game, unsigned int row, unsigned int col);

char game_move (game_t *game, enum GameDirection direction);

#endif // GAME_H_
