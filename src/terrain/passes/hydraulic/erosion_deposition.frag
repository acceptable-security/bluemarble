/**
 * Simulate the Erosion and the Deposition of sediment suspended in water
 */
#version 150 core

in vec2 pos;

uniform sampler2D height_map; // Current heightmap
uniform sampler2D velocity_field; // The velocity field
uniform vec2 map_size; // Size of the current heightmap

const float sediment_capacity = 1.0; // Sediment capacity constant
const float sediment_disolve = 1.0; // Sediment disolving constant
const float sediment_deposit = 1.0; // Sediment deposition constant

out vec4 out_coord;

void main() {
    vec4 our_coord = texture2D(height_map, pos);
    vec2 offset = vec2(1.0, 0.0);

    // Calculate neighbor heights
    float our_left   = texture2D(height_map, pos - offset.xy).x;
    float our_right  = texture2D(height_map, pos + offset.xy).x;
    float our_top    = texture2D(height_map, pos - offset.yx).x;
    float our_bottom = texture2D(height_map, pos + offset.yx).x;

    // Use finite difference method to get normal
    vec3 normal = normalize(vec3(
        our_left - our_right,
        our_top - our_bottom,
        2.0
    ));

    // Calculate the local angle
    float r = pow(normal.x, 2) +
              pow(normal.y, 2) +
              pow(normal.z, 2);

    float angle = acos(normal.z / r);

    // Get the length of our current vector.
    vec4 our_vec = texture2D(velocity_field, pos);
    float vec_len = sqrt(pow(our_vec.x, 2) + pow(our_vec.y, 2) + pow(our_vec.z, 2));

    // Calculate our sediment capacity
    float capacity = sediment_capacity * sin(angle) * vec_len;

    // Calculate the new terrain/sediment heights
    out_coord.y = our_coord.y;

    if ( capacity > our_coord.z ) {
        // Disolve some of the terrain into the water
        out_coord.x = our_coord.x - (sediment_disolve * (capacity - our_coord.z));
        out_coord.z = our_coord.z + (sediment_disolve * (capacity - our_coord.z));
    }
    else {
        // Deposit some of the disolved sediment into the terrain
        out_coord.x = our_coord.x + (sediment_deposit * (our_coord.z - capacity));
        out_coord.z = our_coord.z - (sediment_deposit * (our_coord.z - capacity));
    }
}
