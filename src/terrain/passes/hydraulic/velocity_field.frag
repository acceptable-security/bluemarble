/**
 * Recalculate vector field based off of flow of the water
 */
#version 150 core

in vec4 our_vector; // (u, v, unused, unused)
in vec2 pos;

uniform sampler2D flux_map;
uniform sampler2D height_map; // Map at end of iteration (land, water, sediment, avg B)
uniform vec2 map_size;

const float dX = 1; // Distance between two grid points
const float dY = 1; // ^^

out vec4 new_vector; // (u, v, unused, unused)

vec4 get_influx(vec2 pos) {
    vec4 influx = vec4(0.0, 0.0, 0.0, 0.0);

    if ( pos.x > 0 ) {
        influx.x = texture2D(flux_map, vec2(pos.x - 1, pos.y)).y;
    }

    if ( pos.x < map_size.x ) {
        influx.y = texture2D(flux_map, vec2(pos.x + 1, pos.y)).x;
    }

    if ( pos.y > 0 ) {
        influx.z = texture2D(flux_map, vec2(pos.x, pos.y - 1)).w;
    }

    if ( pos.y < map_size.y ) {
        influx.w = texture2D(flux_map, vec2(pos.x, pos.y + 1)).z;
    }

    return influx;
}

void main() {
    // Calculuate the influx
    vec4 influx = get_influx(pos);

    // Calculuate the outflux
    float our_left_flux = texture2D(flux_map, pos).x;
    float our_right_flux = texture2D(flux_map, pos).y;
    float our_top_flux = texture2D(flux_map, pos).z;
    float our_bottom_flux = texture2D(flux_map, pos).w;

    // Calculate the average water height
    float avg_water_height = texture2D(height_map, pos).w;

    // Calculate amount of water moving through X/Y pipes
    float avg_water_x = (influx.x - our_left_flux + our_right_flux - influx.y) / 2;
    float avg_water_y = (influx.z - our_top_flux + our_bottom_flux - influx.w) / 2;

    // Recalculate vector components
    new_vector = vec4(
        avg_water_x / (dY * avg_water_height),
        avg_water_y / (dX * avg_water_height),
        0.0, 0.0
    );
}
