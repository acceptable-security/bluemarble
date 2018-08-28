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
    float our_left_flux = texture2D(flux_map, pos).x;
    float our_right_flux = texture2D(flux_map, pos).y;
    float our_top_flux = texture2D(flux_map, pos).z;
    float our_bottom_flux = texture2D(flux_map, pos).w;

    // Calculate the average water height
    float avg_water_height = texture2D(height_map, pos).w;

    // Calculate amount of water moving through X/Y pipes
    float avg_water_x = (influx.x - our_left_flux + our_right_flux - influx.y) / 2.0;
    float avg_water_y = (influx.z - our_top_flux + our_bottom_flux - influx.w) / 2.0;

    // Recalculate vector components
    gl_FragColor = vec4(
        avg_water_x / (dY * avg_water_height),
        avg_water_y / (dX * avg_water_height),
        0.0, 0.0
    );
}
