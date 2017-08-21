#include "../terrain.h"
#include <stdbool.h>
#include <limits.h>
#include <float.h>

// Simulate thermal erosion
// Which just moves steep terrain to the lowest point.
void terrain_thermal_erosion(terrain_t* terrain, unsigned int iterations, bool improved) {
    float talus = 4.0 / (float) terrain->map->width;

    for ( int iter_count = 0; iter_count < iterations; iter_count++ ) {
        for ( int x = 1; x < terrain->map->width - 1; x++ ) {
            for ( int y = 1; y < terrain->map->height - 1; y++ ) {
                float current_height = map_get(terrain->map, x, y);
                float max_dif = FLT_MIN;

                int lowest_x = 0;
                int lowest_y = 0;

                for ( int i = -1; i < 2; i += 2 ) {
                    for ( int j = -1; j < 2; j += 2 ) {
                        float current_difference = current_height - map_get(terrain->map, x + i, y + j);

                        if ( current_difference < max_dif ) {
                            max_dif = current_difference;

                            lowest_x = i;
                            lowest_y = j;
                        }
                    }
                }

                if ( improved ) {
                    if ( max_dif > 0 && max_dif <= talus ) {
                        float new_height = current_height - max_dif * 0.5f;

                        map_set(terrain->map, x, y, new_height);
                        map_set(terrain->map, x + lowest_x, y + lowest_y, new_height);
                    }
                }
                else {
                    if ( max_dif > talus ) {
                        float new_height = current_height - max_dif * 0.5f;

                        map_set(terrain->map, x, y, new_height);
                        map_set(terrain->map, x + lowest_x, y + lowest_y, new_height);
                    }
                }
            }
        }
    }
}
