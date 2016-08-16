#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "terrain/random.h"
#include "terrain/cellular_noise.h"
#include "terrain/simplex_noise.h"
#include "terrain/terrain.h"
#include "image/image.h"

void terrain_char_draw(terrain_t* terrain) {
    const char* characters = " `.,-:=+*#@MW";
    unsigned int char_cnt = strlen(characters);

    for ( int y = 0; y < terrain->map->height; y++ ) {
        for ( int x = 0; x < terrain->map->width; x++ ) {
            float val = map_get(terrain->map, x, y);
            printf("%c", characters[(int)(char_cnt - (val * char_cnt))]);
        }

        printf("\n");
    }
}

int main(int argc, char* argv[]) {
    srand(time(NULL));
    permutations_generate();
    grad_generate();

    terrain_t* terrain = terrain_init(800, 600);

    terrain_fill_map(terrain);
    terrain_hydraulic_erosion(terrain, 200);
    terrain_thermal_erosion(terrain, 50, true);

    image_t* image = image_init(800, 600);
    terrain_draw(terrain, image);
    image_write(image, "test.bmp");

    image_clean(image);
    terrain_clean(terrain);

    printf("Done!\n");
    return 0;
}
