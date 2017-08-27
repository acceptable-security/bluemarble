#version 160 core

#define general_skew ((sqrt(3.0) - 1.0) * 0.5)
#define general_unskew ((3.0 - sqrt(3.0)) / 6.0)

in vec2 pos;
out vec4 value;

uniform uint octaves;
uniform float gain;
uniform float lacunarity;
uniform vec2 map_size;

const float grad_s[8] = { 1.00000000000000000000, 0.70710678146758598750, 0.00000000079489665423, -0.70710678034343221743, -1.00000000000000000000, -0.70710678259173953553, -0.00000000238468996268, 0.70710677921927866940};
const float grad_c[8] = { 0.00000000000000000000, 0.70710678090550915798, 1.00000000000000000000, 0.70710678202966281702, 0.00000000158979330845, -0.70710677978135549893, -1.00000000000000000000, -0.70710678315381647607};

// Do a dot product using the gradients
float dot_product(int i, vec2 pos) {
    if ( i == 1 ) {
        return grad_s[i] * pos.x + grad_s[i] * pos.y;
    }
    else {
        return grad_c[i] * pos.x + grad_c[i] * pos.y;
    }
}

// Standard rand function.
float rand(vec2 co) {
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

// Standard rand function extended to support 3 field vector.
float rand(vec3 co) {
    return fract(sin(dot(co.xyz,vec3(12.9898,78.233,99.134))) * 43758.5453);
}

// Get the euclideon distance squared
// (x1-x2)^2 + (y1-y2)^2
float euclidean_squared(vec2 a, vec2 b) {
    float dif_x = a.x - b.x;
    float dif_y = a.y - b.y;

    return (dif_x * dif_x) + (dif_y * dif_y);
}

// Generate Simplex Noise 2D
float simplex(vec2 pos) {
    float skew_value = (pos.x + pos.y) * general_skew;

    vec2 cornerb = floor(pos.xy);

    float unskew_value = (cornerb.x + cornerb.y) * general_unskew;

    vec2 disb = (pos - cornerb) + unskew_value;

    vec2 cornerm = cornerb;

    if ( disb.x > disb.y ) {
        cornerm += vec2(1.0, 0.0);
    }
    else {
        cornerm += vec2(0.0, 1.0);
    }

    vec2 cornert = cornerb + vec2(1.0, 1.0);

    vec2 dism = (disb - (cornerm - cornerb)) + general_unskew;
    vec2 dist = disb - 1.0 + general_unskew + general_unskew;


    int gradb = int(rand(cornerb));
    int gradm = int(rand(cornerm));
    int gradt = int(rand(cornert));

    float tempdis = 0.5f - (disb.x * disb.x) - (disb.y * disb.y);
    float noiseb, noisem, noiset;

    if ( tempdis < 0.0f ) {
        noiseb = 0.0f;
    }
    else {
        tempdis *= tempdis;
        noiseb = tempdis * tempdis * dot_product(gradb, disb);
    }

    tempdis = 0.5f - (dism.x * dism.x) - (dism.y * dism.y);

    if ( tempdis < 0.0f ) {
        noisem = 0.0f;
    }
    else {
        tempdis *= tempdis;
        noisem = tempdis * tempdis * dot_product(gradm, dism);
    }

    tempdis = 0.5f - (dist.x * dist.x) - (dist.y * dist.y);

    if ( tempdis < 0.0f ) {
        noiset = 0.0f;
    }
    else {
        tempdis *= tempdis;
        noiset = tempdis * tempdis * dot_product(gradt, dist);
    }

    return noiseb + noisem + noiset;
}

// Generate Cellular Noise
float cellular(vec2 pos) {
    vec2 points[9];
    float x = pos.x;
    float y = pos.y;

    int floor_x = int(x);
    int floor_y = int(y);

    for ( int i = 0; i < 3; i++ ) {
        for ( int j = 0; j < 3; j++ ) {
            int temp_x = floor_x + i - 1;
            int temp_y = floor_y + j - 1;

            points[(j * 3) + i] = vec2(
                temp_x + rand(vec3(temp_x, temp_y, 1)),
                temp_y + rand(vec3(temp_x, temp_y, 2))
            );
        }
    }

    float dist1 = 999999;
    float dist2 = 999999;

    for ( int i = 0; i < 3; i++ ) {
        for ( int j = 0; j < 3; j++ ) {
            float dist = euclidean_squared(pos, points[(j * 3) + i]);

            if ( dist < dist1 ) {
                if ( dist1 < dist2 ) {
                    dist2 = dist1;
                }

                dist1 = dist;
            }
            else if ( dist < dist2 ) {
                dist2 = dist;
            }
        }
    }

    return dist2 - dist1;
}

void main() {
    float totalCell = 0.0f;
    float totalSimp = 0.0f;
    float frequency = 4.0 / map_size.x;
    float amplitude = 1.0f;

    int octave;

    // 2 octaves of cellular noise
    for ( octave = 0; octave < 2; octave++ ) {
        int offset = octave * 7;
        totalCell += cellular(pos * frequency + offset) * amplitude;

        frequency *= lacunarity;
        amplitude *= gain;
    }

    // Rest of them be simplex noise
    for ( amplitude *= 30; octave < octaves; octave++ ) {
        int offset = octave * 7;
        totalSimp += (simplex(pos * frequency + offset) * amplitude);

        frequency *= lacunarity;
        amplitude *= gain;
    }

    value.x = totalCell + totalSimp;
}
