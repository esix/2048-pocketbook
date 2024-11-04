#include "game_manager.h"
#include <assert.h>
#include <stdlib.h>

struct GameManager
{
    unsigned int size;
    unsigned int start_tiles;
};

game_manager_t *
game_manager_init (
    unsigned int size /* InputManager, Actuator, StorageManager*/)
{
    game_manager_t *game_manager;
    game_manager = malloc (sizeof (struct GameManager));
    if (!game_manager)
        {
            goto fail;
        }
    game_manager->size = size;
    game_manager->start_tiles = 2;
    // this.inputManager   = new InputManager;
    // this.storageManager = new StorageManager;
    // this.actuator       = new Actuator;

    // this.inputManager.on("move", this.move.bind(this));
    // this.inputManager.on("restart", this.restart.bind(this));
    // this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

    game_manager_setup (game_manager);
    return game_manager;

fail:
    if (game_manager)
        {
            free (game_manager);
            game_manager = NULL;
        }

    return NULL;
}


void
game_manager_setup (game_manager_t *game_manager)
{
    //
}
