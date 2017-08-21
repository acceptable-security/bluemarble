/**
 * Recalculate vector field based off of flow of the water
 */
#version 150 core

in vec4 our_vector; // (u, v, unused, unused)
in vec2 pos;

uniform sampler2D flux_map;
uniform sampler2D old_coord; // Map at beginning of iteration (land, water, sediment, unused)
uniform sampler2D new_coord; // Map at end of iteration (land, water, sediment, unused)
const float dX = 1; // Distance between two grid points
const float dY = 1; // ^^

out vec4 new_vector; // (u, v, unused, unused)

void main() {
    // Calculuate the influx
    float left_flux   = texture2D(flux_map, vec2(pos.x - 1, pos.y)).y;
    float right_flux  = texture2D(flux_map, vec2(pos.x + 1, pos.y)).x;
    float top_flux    = texture2D(flux_map, vec2(pos.x, pos.y - 1)).w;
    float bottom_flux = texture2D(flux_map, vec2(pos.x, pos.y + 1)).z;

    // Calculuate the outflux
    float our_left_flux = texture2D(flux_map, pos).x;
    float our_right_flux = texture2D(flux_map, pos).y;
    float our_top_flux = texture2D(flux_map, pos).z;
    float our_bottom_flux = texture2D(flux_map, pos).w;

    // Calculate the average water height
    float avg_water_height = (texture2D(old_coord, pos).y +
                              texture2D(new_coord, pos).y) / 2.0;

    // Calculate amount of water moving through X/Y pipes
    float avg_water_x = (left_flux - our_left_flux + our_right_flux - right_flux) / 2;
    float avg_water_y = (top_flux - our_top_flux + our_bottom_flux - bottom_flux) / 2;

    // Recalculate vector components
    new_vector = vec4(
        avg_water_x / (dY * avg_water_height),
        avg_water_y / (dX * avg_water_height),
        0.0, 0.0
    );
}
