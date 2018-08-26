/**
 * Calculate the new water surface levels
 */

uniform sampler2D height_map; // Current heightmap.
uniform sampler2D flux_map; // Current fluxmap. Fields (left, right, top bottom)

const float dX = 1; // Distance between two grid points
const float dY = 1; // ^^

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
    vec2 pos = gl_FragCoord.xy;
    vec4 our_coord = texture2D(height_map, pos);

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
    gl_FragColor.xz = our_coord.xz;
    gl_FragColor.y += (net_volume) / (dX * dY);
    gl_FragColor.w = (gl_FragColor.y - our_coord.y) / 2;
}
