uniform sampler2D height_map;
uniform vec2 map_size;

float pow2(float x) {
	return x * x;
}

void main() {
	vec2 pos = gl_FragCoord.xy / map_size;
	vec4 our_coord = texture2D(height_map, pos);
	vec2 drop_point = vec2(0, 0);

	float dist = sqrt(pow2(drop_point.x - pos.x) + pow2(drop_point.y - pos.y));
	float map_size = sqrt(pow2(map_size.x) + pow2(map_size.y));

	// Update the water height
	float water = clamp(our_coord.y + (1.0/16.0), 0.0, 1.0);
	gl_FragColor = vec4(our_coord.x, water, our_coord.zw);
}