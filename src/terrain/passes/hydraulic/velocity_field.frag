/**
 * Recalculate vector field based off of flow of the water
 */

uniform sampler2D flux_map;
uniform sampler2D height_map; // Map at end of iteration (land, water, sediment, avg B)
uniform vec2 map_size;

const float dX = 1.0; // Distance between two grid points
const float dY = 1.0; // ^^

vec4 get_influx(vec2 pos) {
    vec2 offset = vec2(1.0, 0.0) / map_size;

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
    vec2 pos = gl_FragCoord.xy / map_size;

    // Calculuate the influx
    vec4 influx = get_influx(pos);

    // Calculuate the outflux
    vec4 our_flux = texture2D(flux_map, pos);

    // Calculate the average water height
    float avg_water_height = texture2D(height_map, pos).w;

    // Calculate amount of water moving through X/Y pipes
    float avg_water_x = ((influx.x - our_flux.x) + (our_flux.y - influx.y)) / 2.0;
    float avg_water_y = ((influx.z - our_flux.z) + (our_flux.w - influx.w)) / 2.0;

    // Recalculate vector components
    gl_FragColor = vec4(
        avg_water_x / (dY * avg_water_height),
        avg_water_y / (dX * avg_water_height),
        0.0, 0.0
    );
}
