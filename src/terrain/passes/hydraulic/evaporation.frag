/**
 * Simulate the evaporation of the water
 */

#version 150 core

in vec2 pos;

uniform sampler2D height_map; // Current heightmap
uniform vec2 map_size; // Size of the current heightmap
uniform float dt; // Time delta

const float evaporation = 1.0; // Water evaporation constant

out vec4 out_coord;

void main() {
    vec4 our_coord = texture2D(height_map, pos);

    // Copy old values
    out_coord.xz = our_coord.xz;

    // Evaporate some water
    out_coord.y = our_coord.y * (1 - evaporation * dt);
}
