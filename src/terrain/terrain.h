#ifndef TERRAIN_H
#define TERRAIN_H

#include "map.h"
#include "../image/image.h"
#include <stdbool.h>

typedef struct {
    map_t* map;
    map_t* water;

    float min;
    float max;

    int octaves;
    float gain;
    float lacunarity;

    float rain_amount; // Amount of rain dropped per pixel each iteration
    float solubility; // How much sediment a unit of water will erode
    float evaporation; // How much water evaptorates from each pixel each iteration
    float capacity; // How much sediment a unit of water can hold
} terrain_t;

terrain_t* terrain_init(int width, int height);
void terrain_fill_map(terrain_t* terrain);

void terrain_normalize(terrain_t* terrain);
void terrain_calculate_bounds(terrain_t* terrain);
void terrain_draw(terrain_t* terrain, image_t* image);

void terrain_thermal_erosion(terrain_t* terrain, unsigned int iterations, bool improved);

void terrain_rain(terrain_t* terrain);
void terrain_evaporate_water(terrain_t* terrain);
void terrain_simulate_water(terrain_t* terrain);
void terrain_hydraulic_erosion(terrain_t* terrain, unsigned int iterations);

void terrain_clean(terrain_t* terrain);

#endif
