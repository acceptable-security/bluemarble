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

vec4 get_delta(vec2 pos, float our_height) {
    vec2 offset = vec2(1.0, 0.0);
    vec4 out_delta;

    if ( pos.x > 0.0 ) {
        // Get the delta for the left
        vec4 left_coord = texture2D(height_map, pos - offset.xy);
        out_delta.x = our_height - (left_coord.x + left_coord.y);
    }
    else {
        out_delta.x = 0.0;
    }

    if ( pos.x < map_size.x ) {
        // Get the delta for the right
        vec4 right_coord = texture2D(height_map, pos + offset.xy);
        out_delta.y = our_height - (right_coord.x + right_coord.y);
    }
    else {
        out_delta.y = 0.0;
    }

    if ( pos.y > 0.0 ) {
        // Get the delta for the top
        vec4 top_coord = texture2D(height_map, pos - offset.yx);
        out_delta.z = our_height - (top_coord.x + top_coord.y);
    }
    else {
        out_delta.z = 0.0;
    }

    if ( pos.y < map_size.y ) {
        // Get the delta for the bottom
        vec4 bottom_coord = texture2D(height_map, pos + offset.yx);
        out_delta.w = our_height - (bottom_coord.x + bottom_coord.y);
    }
    else {
        out_delta.w = 0.0;
    }

    return out_delta;
}

void main() {
    vec2 pos = gl_FragCoord.xy;

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
