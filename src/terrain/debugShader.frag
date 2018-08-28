uniform sampler2D debug_map;
uniform vec2 map_size;

void main() {
    vec2 our_pos = gl_FragCoord.xy / map_size;
    vec4 our_coord = texture2D(debug_map, our_pos);

    gl_FragColor = vec4(our_coord.xyz, 1.0);
}
