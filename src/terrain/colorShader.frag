uniform sampler2D height_map;
uniform vec2 map_size;

vec3 land_low =   vec3(0.0,     0.25,    0.0);
vec3 land_high =  vec3(0.45312, 0.71093, 0.51953);

vec3 water_low =  vec3(0.0,     0.0,     0.21484);
vec3 water_high = vec3(0.0,     0.20703, 0.41406);

vec3 mount_low =  vec3(0.57421, 0.61328, 0.65234);
vec3 mount_high = vec3(0.88281, 0.87109, 0.84375);

float flood = 0.2;
float mount = 0.85;

void main() {
    vec2 our_pos = gl_FragCoord.xy / map_size;
    vec4 our_coord = texture2D(height_map, our_pos);

    float height = our_coord.x;
    float water_height = our_coord.y;

    vec3 ground_color = height < mount ?
                            mix(land_low, land_high, height)
                          : mix(mount_low, mount_high, height);

    vec3 water_color = mix(water_low, water_high, water_height);    

    vec3 mix_color = mix(ground_color, water_color, 0.1);

    gl_FragColor = vec4(ground_color, 1.0);
}
