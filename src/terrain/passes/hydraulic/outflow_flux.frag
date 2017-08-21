/**
 * Calculate the flux values for the virtual pipes during hydraulic erosion
 */
#version 150 core

in vec4 in_flux; // input flux (fL, fR, fT, fB)
in vec2 pos; // (x, y) pair
in float dt; // Time delta
uniform sampler2D height_map; // Current heightmap. Fields: (land, water, sediment, unused)

const float gravity = 9.8; // Acceleration due to gravity
const float A = 0.00005; // Cross sectional area of the virtual pipe
const float l = 1; // Length of the virtual pipe
const float dX = 1; // Distance between two grid points
const float dY = 1; // ^^

const float static_mult = A * gravity * (1 / l); // Precompute part of the computation

out vec4 out_flux; // out flux (fL, fR, fT, fB)

void main() {
    // Precompute as much as possible
    float precomp = dt * static_mult;

    // Get the current information
    vec4 our_coord = texture2D(height_map, pos);
    float our_height = our_coord.x + our_coord.y;

    // Get the delta for the left
    vec4 left_coord = texture2D(height_map, vec2(pos.x - 1, pos.y));
    float left_delta = our_height - (left_coord.x + left_coord.y);

    // Get the delta for the right
    vec4 right_coord = texture2D(height_map, vec2(pos.x + 1, pos.y));
    float right_delta = our_height - (right_coord.x + right_coord.y);

    // Get the delta for the top
    vec4 top_coord = texture2D(height_map, vec2(pos.x, pos.y - 1));
    float top_delta = our_height - (top_coord.x + top_coord.y);

    // Get the delta for the bottom
    vec4 bottom_coord = texture2D(height_map, vec2(pos.x, pos.y + 1));
    float bottom_delta = our_height - (bottom_coord.x + bottom_coord.y);

    // Use a mixture of the precomputed values and the deltas to calculate flux
    out_flux = vec4(
        max(0, precomp * left_delta   + in_flux.x),
        max(0, precomp * right_delta  + in_flux.y),
        max(0, precomp * top_delta    + in_flux.z),
        max(0, precomp * bottom_delta + in_flux.w)
    );

    // Calculate the scaling factor
    float sum = out_flux.x + out_flux.y + out_flux.z + out_flux.w;

    // Calculate the scaling factor
    float scale = min(1, (our_coord.y * dX * dY) / (sum * dt));

    // Apply the scaling factor
    out_flux.xyzw *= scale;
}
