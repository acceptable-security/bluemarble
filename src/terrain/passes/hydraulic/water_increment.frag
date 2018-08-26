uniform sampler2D height_map;

void main() {
	vec2 pos = gl_FragCoord.xy / 64.0;
	vec4 our_coord = texture2D(height_map, pos);

	// Update the water height
	gl_FragColor.xwz = our_coord.xwz;
	gl_FragColor.y = our_coord.y + 0.1;
}