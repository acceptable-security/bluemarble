/**
 * Calculate the new water surface levels
 */
#version 150 core

in vec4 our_coord; // input coord (land, water, sediment, unused)
in vec2 pos; // (x, y)
in float dt; // Time delta

uniform sampler2D flux_map; // Current fluxmap. Fields (left, right, top bottom)
const float dX = 1; // Distance between two grid points
const float dY = 1; // ^^

out vec4 height_coord;

void main() {
    // Calculate our total outflux
    vec4 our_flux = texture2D(flux_map, pos);

    float outflux = our_flux.x +
                    our_flux.y +
                    our_flux.z +
                    our_flux.w;

    // Calculuate component influx values
    float left_flux   = texture2D(flux_map, vec2(pos.x - 1, pos.y)).y;
    float right_flux  = texture2D(flux_map, vec2(pos.x + 1, pos.y)).x;
    float top_flux    = texture2D(flux_map, vec2(pos.x, pos.y - 1)).w;
    float bottom_flux = texture2D(flux_map, vec2(pos.x, pos.y + 1)).z;

    // Calculate total influx
    float influx = left_flux +
                   right_flux +
                   top_flux +
                   bottom_flux;

    // Net Volume = in - out
    float net_volume = influx - outflux;

    // Calculate new water height
    height_coord = our_coord;
    height_coord.y += (net_volume) / (dX * dY);
}
