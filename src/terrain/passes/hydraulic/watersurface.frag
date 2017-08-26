/**
 * Calculate the new water surface levels
 */
#version 150 core

in vec4 our_coord; // input coord (land, water, sediment, avg B)
in vec2 pos; // (x, y)

uniform sampler2D flux_map; // Current fluxmap. Fields (left, right, top bottom)
uniform vec2 map_size; // Size of the current map
uniform float dt; // Time delta

const float dX = 1; // Distance between two grid points
const float dY = 1; // ^^

out vec4 height_coord;

vec4 get_influx(vec2 pos) {
    vec2 offset = vec2(1.0, 0.0);

    // Get the influx values
    vec4 influx = vec4(
        texture2D(flux_map, pos - offset.xy).y,
        texture2D(flux_map, pos + offset.xy).x,
        texture2D(flux_map, pos - offset.yx).w,
        texture2D(flux_map, pos + offset.yx).z
    );

    return influx;
}

void main() {
    // Calculate our total outflux
    vec4 outflux = texture2D(flux_map, pos);

    float outflux_total = outflux.x +
                          outflux.y +
                          outflux.z +
                          outflux.w;

    // Calculuate component influx values
    vec4 influx = get_influx(pos);

    // Calculate total influx
    float influx_total = influx.x +
                         influx.y +
                         influx.z +
                         influx.w;

    // Net Volume = in - out
    float net_volume = influx_total - outflux_total;

    // Calculate new water height
    height_coord = our_coord;
    height_coord.y += (net_volume) / (dX * dY);
    height_coord.w = (height_coord.y - our_coord.y) / 2;
}
