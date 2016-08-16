#ifndef MAP_H
#define MAP_H

typedef struct {
    unsigned int width;
    unsigned int height;

    float* data;
} map_t;

map_t* map_init(unsigned int width, unsigned int height);

inline static float map_get(map_t* map, unsigned int x, unsigned int y) {
    return map->data[(y * map->width) + x];
}

inline static void map_set(map_t* map, unsigned int x, unsigned int y, float value) {
    map->data[(y * map->width) + x] = value;
}

void map_clean(map_t* map);

#endif
