uniform sampler2D height_map;
uniform vec2 map_size;

float pow2(float x) {
	return x * x;
}

void main() {
	vec2 pos = gl_FragCoord.xy / map_size;
	vec4 our_coord = texture2D(height_map, pos);
	vec2 drop_point = map_size / 2.0;

	float dist = abs(sqrt(pow2(drop_point.x - pos.x) + pow2(drop_point.y - pos.y)));

	// Update the water height
	gl_FragColor = vec4(our_coord.x, max(1.0, our_coord.y + dist * (1.0/16.0)), our_coord.zw);
}