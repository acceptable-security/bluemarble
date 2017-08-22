/**
 * Simulate the movement of disolved sediment
 */
#version 150 core

in vec2 pos;
in float dt; // Time delta

uniform sampler2D height_map; // Current heightmap
uniform sampler2D velocity_field; // The velocity field
uniform vec2 map_size; // Size of the current heightmap

out vec4 out_coord;

// Determine if a value is in-grid or not
bool in_grid(vec2 pos) {
    return pos.x > 0 && pos.x < map_size.x &&
           pos.y > 0 && pos.y < map_size.y;
}

void main() {
    vec4 our_coord = texture2D(height_map, pos);
    vec4 our_velocity = texture2D(velocity_field, pos);

    // Take a eulerian step back
    vec2 back_pos = pos - (our_velocity.xy * dt);

    // Copy old values
    out_coord.xy = our_coord.xy;

    if ( in_grid(back_pos) ) {
        // Copy the value
        out_coord.z = texture2D(height_map, back_pos).z;
    }
    else {
        // TODO - interpoliate between four nearest neighbors
    }
}
