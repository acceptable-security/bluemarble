/**
 * Implementation of a cellular noise generator in GLSL
 */

#version 150 core

in vec2 pos;
out vec4 cell;

// Standard rand function extended to support 3 field vector.
float rand(vec3 co) {
    return fract(sin(dot(co.xyz,vec3(12.9898,78.233,99.134))) * 43758.5453);
}

float euclidean_squared(float x1, float y1, float x2, float y2) {
    float dif_x = x1 - x2;
    float dif_y = y1 - y2;

    return (dif_x * dif_x) + (dif_y * dif_y);
}

void main() {
    float points[9 * 2];
    float x = pos.x;
    float y = pos.y;

    int floor_x = int(x);
    int floor_y = int(y);

    for ( int i = 0; i < 3; i++ ) {
        for ( int j = 0; j < 3; j++ ) {
            int temp_x = floor_x + i - 1;
            int temp_y = floor_y + j - 1;

            points[(j * 3) + i] = temp_x + rand(vec3(temp_x, temp_y, 1));
            points[9 + (j * 3) + i] = temp_y + rand(vec3(temp_x, temp_y, 2));
        }
    }

    float dist1 = 999999;
    float dist2 = 999999;

    for ( int i = 0; i < 3; i++ ) {
        for ( int j = 0; j < 3; j++ ) {
            float dist = euclidean_squared(x, y, points[(j * 3) + i], points[9 + (j * 3) + i]);

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

    cell.x = dist2 - dist1;
}
