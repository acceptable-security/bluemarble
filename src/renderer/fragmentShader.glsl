#version 330 core

out vec4 color;
in float scale;
in float height;

vec3 land_low =   vec3(0.0,     0.25,    0.0);
vec3 land_high =  vec3(0.45312, 0.71093, 0.51953);

vec3 water_low =  vec3(0.0,     0.0,     0.21484);
vec3 water_high = vec3(0.0,     0.20703, 0.41406);

vec3 mount_low =  vec3(0.57421, 0.61328, 0.65234);
vec3 mount_high = vec3(0.88281, 0.87109, 0.84375);

float flood = 0.2 * scale;
float mount = 0.85 * scale;

void main() {
    float dif = scale;

    if ( height < flood ) {
        color = vec4(mix(water_low, water_high, (height) / dif), 1.0);
    }
    else if ( height > mount ) {
        color = vec4(mix(mount_low, mount_high, (height) / dif), 1.0);
    }
    else {
        color = vec4(mix(land_low, land_high, (height) / dif), 1.0);
    }

    // color = vec4(1.0f, 0.5f, 0.2f, 1.0f);
}
