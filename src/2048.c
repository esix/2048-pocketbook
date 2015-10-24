#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <sys/mount.h>
#include <dlfcn.h>
#include <pthread.h>
#include "inkview.h"
#include "game.h"


extern const m3x3;

static const char *strings3x3[9] = {
	"New Game",
	"-",
	"-",
	"-",
	"+",
	"-",
	"-",
	"-",
	"Exit"
};

static struct Game *g_game;
static ifont *arial8n, *arial12, *arialb12, *cour16, *cour24, *times20;


int main_handler(int type, int par1, int par2);


void msg(char *s)
{
	FillArea(350, 770, 250, 20, WHITE);
	SetFont(arialb12, BLACK);
	DrawString(350, 770, s);
	PartialUpdate(350, 770, 250, 20);
}


void
paint_game (struct Game *game)
{
	int i, k, w, h, val;
	char c;
	int screen_width, screen_height;

	msg("Paint game");

	//SetFont(arial12, BLACK);
	SetFont(cour24, BLACK);

	screen_width = ScreenWidth();
	screen_height = ScreenHeight();
	int min_screen_size = screen_width < screen_height ? screen_width : screen_height;
	printf("min_screen_size=%d\n", min_screen_size);
	int margin = min_screen_size * 1 / 5;

	w = (screen_width - 2 * margin) / COLS;
	h = (screen_height - 2* margin) / ROWS;

	int size = w < h ? w : h;
	printf("w=%d, h=%d, size=%d\n", w, h, size);

	FillArea(margin, margin, size * COLS, size * ROWS, WHITE);

	for (i=0; i<ROWS; i++)
		{
			for (k=0; k<COLS; k++)
				{
					c = game_get(game, i, k);
					val = (1 << c);
					char s_val[10];
					sprintf(s_val,"%d",val);

					if(c == 0)
						{
							sprintf(s_val, " ");
						}

					DrawRect(margin + k*size, margin + i*size, size, size, LGRAY);
					DrawTextRect(margin + k*size, margin + i*size, size, size, s_val, ALIGN_CENTER | VALIGN_MIDDLE);
				}
		}

	PartialUpdate(margin, margin, size * COLS, size * ROWS);
	//FullUpdate();
}


void
mainscreen_repaint() {
	ClearScreen();
	paint_game (g_game);
	FullUpdate();
}


void
menu3x3_handler(int pos) {
	char buf[16];
	sprintf(buf, "Menu: %i", pos);
	msg(buf);
}




int
main_handler(int type, int par1, int par2) {
	fprintf(stderr, "[%i %i %i]\n", type, par1, par2);

	if (type == EVT_INIT)
		{
			g_game = game_init (ROWS, COLS);
			game_new (g_game);

			arial8n = OpenFont("LiberationSans", 8, 0);
			arial12 = OpenFont("LiberationSans", 12, 1);
			arialb12 = OpenFont("LiberationSans", 12, 1);
			cour16 = OpenFont("LiberationMono", 16, 1);
			cour24 = OpenFont("LiberationMono", 24, 1);
			times20 = OpenFont("LiberationSerif", 20, 1);
		}

		if (type == EVT_SHOW) {
			// occurs when this event handler becomes active
			ClearScreen();
			mainscreen_repaint();
		}

		if (type == EVT_KEYPRESS)
			{
			switch (par1)
				{
				case KEY_OK:
					OpenMenu3x3(&m3x3, strings3x3, menu3x3_handler);
					break;

				case KEY_BACK:
					CloseApp();
					break;

				case KEY_LEFT:
					msg("KEY_LEFT");
					game_move (g_game, E_GAME_LEFT);
					paint_game (g_game);
					//mainscreen_repaint();
					break;

				case KEY_RIGHT:
					msg("KEY_RIGHT");
					game_move (g_game, E_GAME_RIGHT);
					paint_game (g_game);
					//mainscreen_repaint();
					break;

				case KEY_UP:
					msg("KEY_UP");
					game_move (g_game, E_GAME_UP);
					paint_game (g_game);
					//mainscreen_repaint();
					break;

				case KEY_DOWN:
					msg("KEY_DOWN");
					game_move (g_game, E_GAME_DOWN);
					paint_game (g_game);
					//mainscreen_repaint();
					break;

				case KEY_MUSIC:
					msg("KEY_MUSIC");
					break;

				case KEY_MENU:
					msg("KEY_MENU");
					break;

				case KEY_DELETE:
					msg("KEY_DELETE");
					break;
				}
		}

	if (type == EVT_EXIT) {
		// save highscore
	}

	return 0;
}



int
main(int argc, char **argv)
{
	InkViewMain(main_handler);
	return 0;
}
