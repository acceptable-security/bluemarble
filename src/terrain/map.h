#ifndef MAP_H
#define MAP_H

typedef struct {
    unsigned int width;
    unsigned int height;

    float** data;
} map_t;

map_t* map_init(unsigned int width, unsigned int height);
void map_clean(map_t* map);

#endif
