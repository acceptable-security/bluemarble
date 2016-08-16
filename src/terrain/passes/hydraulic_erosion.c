#include "../terrain.h"
#include <limits.h>
#include <float.h>

void terrain_rain(terrain_t* terrain) {
    for ( int x = 0; x < terrain->water->width; x++ ) {
        for ( int y = 0; y < terrain->water->height; y++ ) {
            map_set(terrain->water, x, y, map_get(terrain->water, x, y) + terrain->rain_amount);
            map_set(terrain->map, x, y, map_get(terrain->map, x, y) - map_get(terrain->water, x, y) * terrain->solubility);
        }
    }
}

void terrain_evaporate_water(terrain_t* terrain) {
    for ( int x = 0; x < terrain->map->width; x++ ) {
        for ( int y = 0; y < terrain->map->height; y++ ) {
            if ( map_get(terrain->water, x, y) > 0 ) {
                float water_lost = map_get(terrain->water, x, y) * terrain->evaporation;

                map_set(terrain->water, x, y, map_get(terrain->water, x, y) - water_lost);
                map_set(terrain->map, x, y, map_get(terrain->map, x, y) + water_lost * terrain->capacity);
            }
        }
    }
}

void terrain_simulate_water(terrain_t* terrain) {
    for ( int x = 1; x < terrain->water->width - 1; x++ ) {
        for ( int y = 1; y < terrain->water->height - 1; y++ ) {
            float current_height = map_get(terrain->map, x, y) + map_get(terrain->water, x, y);
            float max_dif = FLT_MIN;
            int lowest_x = 0;
            int lowest_y = 0;

            for ( int i = -1; i < 2; i++ ) {
                for ( int j = -1; j < 2; j++ ) {
                    float current_difference = current_height - map_get(terrain->map, x + i, y + j) - map_get(terrain->water, x + i, y + j);

                    if ( current_difference > max_dif ) {
                        max_dif = current_difference;

                        lowest_x = i;
                        lowest_y = j;
                    }
                }
            }

            if ( max_dif > 0 ) {
                if ( map_get(terrain->water, x, y) < max_dif ) {
                    map_set(terrain->water, x + lowest_x, y + lowest_y, map_get(terrain->water, x + lowest_x, y + lowest_y) + map_get(terrain->water, x, y));
                    map_set(terrain->water, x, y, 0);
                }
                else {
                    map_set(terrain->water, x + lowest_x, y + lowest_y, map_get(terrain->water, x + lowest_x, y + lowest_y) + max_dif / 2.0f);
                    map_set(terrain->water, x, y, map_get(terrain->water, x, y) - max_dif / 2.0f);
                }
            }
        }
    }
}

void terrain_hydraulic_erosion(terrain_t* terrain, unsigned int iterations) {
    for ( int iter_count = 0; iter_count < iterations; iter_count++ ) {
        terrain_rain(terrain);
        terrain_simulate_water(terrain);
    }

    terrain_evaporate_water(terrain);
}
