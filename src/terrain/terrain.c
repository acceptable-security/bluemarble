#include "map.h"
#include "terrain.h"

#include "simplex_noise.h"
#include "cellular_noise.h"

#include <stdlib.h>
#include <stdbool.h>
#include <limits.h>
#include <float.h>

terrain_t* terrain_init(int width, int height) {
    terrain_t* terrain = (terrain_t*) malloc(sizeof(terrain_t));

    if ( terrain == NULL ) {
        return NULL;
    }

    terrain->map = map_init(width, height);

    if ( terrain->map == NULL ) {
        free(terrain);
        return NULL;
    }

    terrain->water = map_init(width, height);

    if ( terrain->water == NULL ) {
        map_clean(terrain->map);
        free(terrain);
        return NULL;
    }

    terrain->rain_amount = 0.01;
    terrain->solubility = 0.01;
    terrain->evaporation = 0.9;
    terrain->capacity = terrain->solubility;

    terrain->octaves = 7;
    terrain->gain = 0.65;
    terrain->lacunarity = 2.0;

    terrain->max = FLT_MIN;
    terrain->min = FLT_MAX;


    return terrain;
}

void terrain_fill_map(terrain_t* terrain) {
    float freq = 4.0 / terrain->map->width;

    for ( int x = 0; x < terrain->map->width; x++ ) {
        for ( int y = 0; y < terrain->map->height; y++ ) {
            float totalCell = 0.0f;
            float totalSimp = 0.0f;
            float frequency = freq;
            float amplitude = 1.0f;

            int i;

            for ( i = 0; i < 2; i++ ) {
                int offset = i * 7;
                totalCell += cellular_noise(x * frequency + offset, y * frequency + offset) * amplitude;

                frequency *= terrain->lacunarity;
                amplitude *= terrain->gain;
            }

            for ( amplitude *= 30; i < terrain->octaves; i++ ) {
                int offset = i * 7;
                totalSimp += (simplex_noise_2d(x * frequency + offset, y * frequency + offset) * amplitude);

                frequency *= terrain->lacunarity;
                amplitude *= terrain->gain;
            }

            map_set(terrain->map, x, y, totalCell + totalSimp);

            if ( map_get(terrain->map, x, y) > terrain->max ) {
                terrain->max = map_get(terrain->map, x, y);
            }

            if ( map_get(terrain->map, x, y) < terrain->min ) {
                terrain->min = map_get(terrain->map, x, y);
            }
        }
    }

    terrain_normalize(terrain);
}

void terrain_calculate_bounds(terrain_t* terrain) {
    terrain->min = FLT_MAX;
    terrain->max = FLT_MIN;

    for ( int x = 0; x < terrain->map->width; x++ ) {
        for ( int y = 0; y < terrain->map->height; y++ ) {
            if ( map_get(terrain->map, x, y) < terrain->min ) {
                terrain->min = map_get(terrain->map, x, y);
            }

            if ( map_get(terrain->map, x, y) > terrain->max ) {
                terrain->max = map_get(terrain->map, x, y);
            }
        }
    }
}

void terrain_normalize(terrain_t* terrain) {
    for ( int x = 0; x < terrain->map->width; x++ ) {
        for ( int y = 0; y < terrain->map->height; y++ ) {
            map_set(terrain->map, x, y, (map_get(terrain->map, x, y) - terrain->min) / (terrain->max - terrain->min));
        }
    }
}

void terrain_draw(terrain_t* terrain, image_t* image) {
    color_t land_low = COLOR(0, 64, 0);
    color_t land_high = COLOR(116, 182, 133);

    color_t water_low = COLOR(0, 0, 55);
    color_t water_high = COLOR(0, 53, 106);

    color_t mount_low = COLOR(147, 157, 167);
    color_t mount_high = COLOR(226, 223, 216);

    float flood = 0.2;
    float mount = 0.85;

    terrain_calculate_bounds(terrain);
    terrain_normalize(terrain);

    float dif = (terrain->max - terrain->min);

    for ( int x = 0; x < terrain->map->width; x++ ) {
        for ( int y = 0; y < terrain->map->height; y++ ) {
            color_t color;

            if ( map_get(terrain->water, x, y) > flood ) {
                color = lerp(water_low, water_high, (map_get(terrain->map, x, y) + map_get(terrain->water, x, y)) / dif);
            }
            else if ( map_get(terrain->map, x, y) > mount ) {
                color = lerp(mount_low, mount_high, (map_get(terrain->map, x, y)) / dif);
            }
            else {
                color = lerp(land_low, land_high, (map_get(terrain->map, x, y)) / dif);
            }

            image_set(image, x, y, color);
        }
    }
}

void terrain_clean(terrain_t* terrain) {
    if ( terrain == NULL ) {
        return;
    }

    map_clean(terrain->map);
    map_clean(terrain->water);

    free(terrain);
}
