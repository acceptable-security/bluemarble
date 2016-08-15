#include <stdlib.h>
#include <string.h>
#include "map.h"

map_t* map_init(unsigned int width, unsigned int height) {
    map_t* map = (map_t*) malloc(sizeof(map_t));

    if ( map == NULL ) {
        return NULL;
    }

    map->width = width;
    map->height = height;

    map->data = (float**) malloc(sizeof(float*) * width);

    if ( map->data == NULL ) {
        free(map);
        return NULL;
    }

    memset(map->data, 0, sizeof(float*) * width);

    for ( int x = 0; x < width; x++ ) {
        map->data[x] = (float*) malloc(sizeof(float) * height);

        if ( map->data[x] == NULL ) {
            map_clean(map);
            return NULL;
        }

        memset(map->data[x], 0, sizeof(float) * height);
    }

    return map;
}

void map_clean(map_t* map) {
    if ( map == NULL ) {
        return;
    }

    if ( map->data != NULL ) {
        for ( int x = 0; x < map->width; x++ ) {
            if ( map->data[x] != NULL ) {
                free(map->data[x]);
            }
        }

        free(map->data);
    }

    free(map);
}
