/**
 * Simulate the movement of disolved sediment and evaporate water
 */

uniform sampler2D height_map; // Current heightmap
uniform sampler2D velocity_field; // The velocity field
uniform float dt; // Time delta
uniform vec2 map_size;

const float evaporation = 0.00011*0.5; // % of water to evaporate

// Determine if a value is in-grid or not
bool in_grid(vec2 pos) {
    return pos.x >= 0.0 && pos.x < (map_size.x) &&
           pos.y >= 0.0 && pos.y < (map_size.y);
}

void main() {
    vec2 pos = gl_FragCoord.xy / map_size;

    vec4 our_coord = texture2D(height_map, pos);
    vec4 our_velocity = texture2D(velocity_field, pos);

    // Take a eulerian step back
    vec2 back_pos = pos - ((our_velocity.xy / map_size) * dt);
    back_pos = clamp(back_pos, vec2(0, 0), map_size);
    gl_FragColor.xw = our_coord.xw;
    gl_FragColor.z = texture2D(height_map, back_pos).z;
    // Evaporate
    gl_FragColor.y = max(0.0, our_coord.y * (1.0 - evaporation * dt));
}
