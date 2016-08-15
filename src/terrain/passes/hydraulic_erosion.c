#include "../terrain.h"
#include <limits.h>
#include <float.h>

void terrain_rain(terrain_t* terrain) {
    for ( int x = 0; x < terrain->water->width; x++ ) {
        for ( int y = 0; y < terrain->water->height; y++ ) {
            terrain->water->data[x][y] += terrain->rain_amount;
            terrain->map->data[x][y] -= terrain->water->data[x][y] * terrain->solubility;
        }
    }
}

void terrain_evaporate_water(terrain_t* terrain) {
    for ( int x = 0; x < terrain->map->width; x++ ) {
        for ( int y = 0; y < terrain->map->height; y++ ) {
            if ( terrain->water->data[x][y] > 0 ) {
                float water_lost = terrain->water->data[x][y] * terrain->evaporation;

                terrain->water->data[x][y] -= water_lost;
                terrain->map->data[x][y] += water_lost * terrain->capacity;
            }
        }
    }
}

void terrain_simulate_water(terrain_t* terrain) {
    for ( int x = 1; x < terrain->water->width - 1; x++ ) {
        for ( int y = 1; y < terrain->water->height - 1; y++ ) {
            float current_height = terrain->map->data[x][y] + terrain->water->data[x][y];
            float max_dif = FLT_MIN;
            int lowest_x = 0;
            int lowest_y = 0;

            for ( int i = -1; i < 2; i++ ) {
                for ( int j = -1; j < 2; j++ ) {
                    float current_difference = current_height - terrain->map->data[x + i][y + j] - terrain->water->data[x + i][y + j];

                    if ( current_difference > max_dif ) {
                        max_dif = current_difference;

                        lowest_x = i;
                        lowest_y = j;
                    }
                }
            }

            if ( max_dif > 0 ) {
                if ( terrain->water->data[x][y] < max_dif ) {
                    terrain->water->data[x + lowest_x][y + lowest_y] += terrain->water->data[x][y];
                    terrain->water->data[x][y] = 0;
                }
                else {
                    terrain->water->data[x + lowest_x][y + lowest_y] += max_dif / 2.0f;
                    terrain->water->data[x][y] -= max_dif / 2.0f;
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
