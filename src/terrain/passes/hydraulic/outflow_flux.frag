/**
 * Calculate the flux values for the virtual pipes during hydraulic erosion
 */
#version 150 core

in vec4 in_flux; // input flux (fL, fR, fT, fB)
in vec2 pos; // (x, y) pair
in float dt; // Time delta

uniform sampler2D height_map; // Current heightmap. Fields: (land, water, sediment, unused)
uniform vec2 map_size; // Size of the current heightmap.

const float gravity = 9.8; // Acceleration due to gravity
const float A = 0.00005; // Cross sectional area of the virtual pipe
const float l = 1; // Length of the virtual pipe
const float dX = 1; // Distance between two grid points
const float dY = 1; // ^^

const float static_mult = A * gravity * (1 / l); // Precompute part of the computation

out vec4 out_flux; // out flux (fL, fR, fT, fB)

vec4 get_delta(vec2 pos, float our_height) {
    vec4 out_delta;

    if ( pos.x > 0 ) {
        // Get the delta for the left
        vec4 left_coord = texture2D(height_map, vec2(pos.x - 1, pos.y));
        float left_delta = our_height - (left_coord.x + left_coord.y);

        out_delta.x = left_delta;
    }
    else {
        out_delta.x = 0;
    }

    if ( pos.x < map_size.x ) {
        // Get the delta for the right
        vec4 right_coord = texture2D(height_map, vec2(pos.x + 1, pos.y));
        float right_delta = our_height - (right_coord.x + right_coord.y);

        out_delta.y = right_delta;
    }
    else {
        out_delta.y = 0;
    }

    if ( pos.y > 0 ) {
        // Get the delta for the top
        vec4 top_coord = texture2D(height_map, vec2(pos.x, pos.y - 1));
        float top_delta = our_height - (top_coord.x + top_coord.y);

        out_delta.z = top_delta;
    }
    else {
        out_delta.z = 0;
    }

    if ( pos.y < map_size.y ) {
        // Get the delta for the bottom
        vec4 bottom_coord = texture2D(height_map, vec2(pos.x, pos.y + 1));
        float bottom_delta = our_height - (bottom_coord.x + bottom_coord.y);

        out_delta.w = bottom_delta;
    }
    else {
        out_delta.w = 0;
    }

    return out_delta;
}

void main() {
    // Precompute as much as possible
    float precomp = dt * static_mult;

    // Get our information
    vec4 our_coord = texture2D(height_map, pos);
    float our_height = our_coord.x + our_coord.y;

    // Calculate the deltas
    vec4 deltas = get_delta(pos, our_height);

    // Use a mixture of the precomputed values and the deltas to calculate flux
    out_flux = vec4(
        max(0, precomp * deltas.x + in_flux.x),
        max(0, precomp * deltas.y + in_flux.y),
        max(0, precomp * deltas.z + in_flux.z),
        max(0, precomp * deltas.w + in_flux.w)
    );

    // Calculate the scaling factor
    float sum = out_flux.x + out_flux.y + out_flux.z + out_flux.w;

    // Calculate the scaling factor
    float scale = min(1, (our_coord.y * dX * dY) / (sum * dt));

    // Apply the scaling factor
    out_flux.xyzw *= scale;
}
