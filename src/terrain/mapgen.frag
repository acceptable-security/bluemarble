#version 200 es
precision mediump float;

attribute vec2 pos;

const float general_skew = 0.3660254037844386;
const float general_unskew = 0.21132486540518713; 

const float gain = 0.65;
const float lacunarity = 2.0;
vec2 map_size = vec2(800, 600);

float grad_s[8];
float grad_c[8];

void setup_grad() {
    grad_s[0] = 1.0;
    grad_s[1] = 0.70710678146758598750;
    grad_s[2] = 0.00000000079489665423;
    grad_s[3] = -0.70710678034343221743;
    grad_s[4] = -1.0;
    grad_s[5] = -0.70710678259173953553;
    grad_s[6] = -0.00000000238468996268;
    grad_s[7] = 0.70710677921927866940;

    grad_c[0] = 0.0;
    grad_c[1] = 0.70710678090550915798;
    grad_c[2] = 1.0;
    grad_c[3] = 0.70710678202966281702;
    grad_c[4] = 0.00000000158979330845;
    grad_c[5] = -0.70710677978135549893;
    grad_c[6] = -1.00000000000000000000;
    grad_c[7] = -0.70710678315381647607;
}

// Do a dot product using the gradients
float dot_product(int i, vec2 pos) {
    if ( i == 0 ) {
        return grad_s[0] * pos.x + grad_c[0] * pos.y;
    }
    else if ( i == 1 ) {
        return grad_s[1] * pos.x + grad_c[1] * pos.y;
    }
    else if ( i == 2 ) {
        return grad_s[2] * pos.x + grad_c[2] * pos.y;
    }
    else if ( i == 3 ) {
        return grad_s[3] * pos.x + grad_c[3] * pos.y;
    }
    else if ( i == 4 ) {
        return grad_s[4] * pos.x + grad_c[4] * pos.y;
    }
    else if ( i == 5 ) {
        return grad_s[5] * pos.x + grad_c[5] * pos.y;
    }
    else if ( i == 6 ) {
        return grad_s[6] * pos.x + grad_c[6] * pos.y;
    }
    else if ( i == 7 ) {
        return grad_s[7] * pos.x + grad_c[7] * pos.y;
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

    vec2 cornerb = floor(pos.xy + skew_value);

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

    int gradb = int(rand(cornerb) * 7.0);
    int gradm = int(rand(cornerm) * 7.0);
    int gradt = int(rand(cornert) * 7.0);

    float noiseb = 0.0;
    float noisem = 0.0;
    float noiset = 0.0;

    float tempdis = 0.5 - (disb.x * disb.x) - (disb.y * disb.y);

    if ( tempdis > 0.0 ) {
        tempdis *= tempdis;
        noiseb = tempdis * tempdis * dot_product(gradb, disb);
    }

    tempdis = 0.5 - (dism.x * dism.x) - (dism.y * dism.y);

    if ( tempdis > 0.0 ) {
        tempdis *= tempdis;
        noisem = tempdis * tempdis * dot_product(gradm, dism);
    }

    tempdis = 0.5 - (dist.x * dist.x) - (dist.y * dist.y);

    if ( tempdis > 0.0 ) {
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
            float temp_x = float(floor_x + i - 1);
            float temp_y = float(floor_y + j - 1);

            points[(j * 3) + i] = vec2(
                temp_x + rand(vec3(temp_x, temp_y, 1)),
                temp_y + rand(vec3(temp_x, temp_y, 2))
            );
        }
    }

    float dist1 = 999999.0;
    float dist2 = 999999.0;

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
    setup_grad();
    
    float totalCell = 0.0;
    float totalSimp = 0.0;
    float frequency = 4.0 / map_size.x;
    float amplitude = 1.0;

    int octave = 0;

    // 2 octaves of cellular noise
    for ( int i = 0; i < 2; i++ ) {
        int offset = octave * 7;
        totalCell += cellular(pos * frequency + vec2(offset, offset)) * amplitude;

        frequency *= lacunarity;
        amplitude *= gain;
        octave++;
    }

    amplitude *= 30.0;

    // Rest of them be simplex noise
    for ( int j = 0; j < 8; j++ ) {
        int offset = octave * 7;
        totalSimp += (simplex(pos * frequency + vec2(offset, offset)) * amplitude);

        frequency *= lacunarity;
        amplitude *= gain;
        octave++;
    }

    float dicks = totalCell + totalSimp;
    gl_FragColor = vec4(dicks, dicks, dicks, 1.0);
}