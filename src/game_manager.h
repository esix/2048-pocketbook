#ifndef GAME_MANAGER_H_
#define GAME_MANAGER_H_

typedef struct GameManager game_manager_t;

game_manager_t *game_manager_init (unsigned int size);

void game_manager_free ();
void game_manager_setup (game_manager_t *);

#endif // GAME_MANAGER_H_
