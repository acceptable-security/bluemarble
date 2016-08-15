#include <math.h>
#include <limits.h>
#include <stdio.h>
#include <float.h>
#include "random.h"

float euclidean_squared(float x1, float y1, float x2, float y2) {
    float dif_x = x1 - x2;
    float dif_y = y1 - y2;

    return (dif_x * dif_x) + (dif_y * dif_y);
}

float cellular_noise(float x, float y) {
    float points[3][3][2];

    for ( int i = 0; i < 3; i++ ) {
        for ( int j = 0; j < 3; j++ ) {
            int temp_x = x + (float) i - 1.0f;
            int temp_y = y + (float) j - 1.0f;

            points[i][j][0] = temp_x + random3(temp_x, temp_y, 1);
            points[i][j][1] = temp_y + random3(temp_x, temp_y, 2);
        }
    }

    float dist1 = FLT_MAX;
    float dist2 = FLT_MAX;

    for ( int i = 0; i < 3; i++ ) {
        for ( int j = 0; j < 3; j++ ) {
            float dist = euclidean_squared(x, y, points[i][j][0], points[i][j][1]);

            if ( dist < dist1 ) {
                if ( dist1 < dist2 ) {
                    dist2 = dist1;
                }

                dist1 = dist;
            }
            else if ( dist < dist2 ) {
                dist2 = dist;
            }
        }
    }

    return dist2 - dist1;
}
