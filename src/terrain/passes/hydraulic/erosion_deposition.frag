/**
 * Simulate the Erosion and the Deposition of sediment suspended in water
 */

uniform sampler2D height_map; // Current heightmap
uniform sampler2D velocity_field; // The velocity field

const float sediment_capacity = 1.0; // Sediment capacity constant
const float sediment_disolve = 1.0; // Sediment disolving constant
const float sediment_deposit = 1.0; // Sediment deposition constant

float pow2(float x) {
    return x * x;
}

void main() {
    vec2 pos = gl_FragCoord.xy;

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

    // Calculate the localgle
    float r = pow2(normal.x) +
              pow2(normal.y) +
              pow2(normal.z);

    float angle = acos(normal.z / r);

    // Get the length of our current vector.
    vec4 our_vec = texture2D(velocity_field, pos);
    float vec_len = sqrt(pow2(our_vec.x) + pow2(our_vec.y) + pow2(our_vec.z));

    // Calculate our sediment capacity
    float capacity = sediment_capacity * sin(angle) * vec_len;

    // Calculate the new terrain/sediment heights
    gl_FragColor.yw = our_coord.yw;

    if ( capacity > our_coord.z ) {
        // Disolve some of the terrain into the water
        gl_FragColor.x = our_coord.x - (sediment_disolve * (capacity - our_coord.z));
        gl_FragColor.z = our_coord.z + (sediment_disolve * (capacity - our_coord.z));
    }
    else {
        // Deposit some of the disolved sediment into the terrain
        gl_FragColor.x = our_coord.x + (sediment_deposit * (our_coord.z - capacity));
        gl_FragColor.z = our_coord.z - (sediment_deposit * (our_coord.z - capacity));
    }
}
