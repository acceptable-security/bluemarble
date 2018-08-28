/**
 * Calculate the flux values for the virtual pipes during hydraulic erosion
 */


uniform sampler2D flux_map; // Current flux map
uniform sampler2D height_map; // Current heightmap. Fields: (land, water, sediment, unused)
uniform vec2 map_size;
uniform float dt; // Time delta

const float gravity = 9.8; // Acceleration due to gravity
const float A = 0.00005; // Cross sectional area of the virtual pipe
const float l = 1.0; // Length of the virtual pipe
const float dX = 1.0; // Distance between two grid points
const float dY = 1.0; // ^^

const float static_mult = A * gravity * (1.0 / l); // Precompute part of the computation

float get_height(vec2 pos, vec2 offset) {
    vec2 poff = pos + offset;

    if ( poff.x < 0.0 || poff.x >= 1. / map_size.x ||
         poff.y < 0.0 || poff.y >= 1. / map_size.y ) {
        return -1.0;
    }

    vec4 coord = texture2D(height_map, poff);
    return coord.x + coord.y;
}

vec4 get_delta(vec2 pos, float our_height) {
    vec2 offset = vec2(1.0, 0.0) / map_size;
    vec4 out_delta;

    float left_height   = get_height(pos, -offset.xy);
    float right_height  = get_height(pos,  offset.xy);
    float top_height    = get_height(pos, -offset.yx);
    float bottom_height = get_height(pos,  offset.yx);

    if ( left_height >= 0.0 ) out_delta.x = our_height - left_height;
    else                      out_delta.x = 0.0;


    if ( right_height >= 0.0 ) out_delta.y = our_height - right_height;
    else                       out_delta.y = 0.0;

    if ( top_height >= 0.0 ) out_delta.z = our_height - top_height;
    else                     out_delta.z = 0.0;

    if ( bottom_height >= 0.0) out_delta.w = our_height - bottom_height;
    else                       out_delta.w = 0.0;

    return out_delta;
}

void main() {
    vec2 pos = gl_FragCoord.xy / map_size;

    // Precompute as much as possible
    float precomp = dt * static_mult;

    // Get our information
    vec4 our_coord = texture2D(height_map, pos);
    float our_height = our_coord.x + our_coord.y;
    vec4 in_flux = texture2D(flux_map, pos);

    // Calculate the deltas
    vec4 deltas = get_delta(pos, our_height);

    // Use a mixture of the precomputed values and the deltas to calculate flux
    vec4 out_flux = vec4(
        max(0.0, precomp * deltas.x + in_flux.x),
        max(0.0, precomp * deltas.y + in_flux.y),
        max(0.0, precomp * deltas.z + in_flux.z),
        max(0.0, precomp * deltas.w + in_flux.w)
    );

    // Calculate the scaling factor
    float sum = out_flux.x + out_flux.y + out_flux.z + out_flux.w;

    // Calculate the scaling factor
    float scale = min(1.0, (our_coord.y * dX * dY) / (sum * dt));

    // Apply the scaling factor
    gl_FragColor = out_flux * scale;
}
