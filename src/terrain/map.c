#include <stdlib.h>
#include <string.h>
#include "map.h"

// Allocate a map instance.
map_t* map_init(unsigned int width, unsigned int height) {
    map_t* map = (map_t*) malloc(sizeof(map_t));

    if ( map == NULL ) {
        return NULL;
    }

    map->width = width;
    map->height = height;

    map->data = (float*) malloc(sizeof(float*) * (width * height));

    if ( map->data == NULL ) {
        free(map);
        return NULL;
    }

    memset(map->data, 0, sizeof(float*) * (width * height));

    return map;
}

// Free a map instance.
void map_clean(map_t* map) {
    if ( map == NULL ) {
        return;
    }

    if ( map->data != NULL ) {
        free(map->data);
    }

    free(map);
}
