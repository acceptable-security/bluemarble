/**
 * Implementation of simplex noise in GLSL
 */

#version 160 core

#define general_skew ((sqrt(3.0) - 1.0) * 0.5)
#define general_unskew ((3.0 - sqrt(3.0)) / 6.0)

in vec2 pos;
out vec4 simplex;

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

float rand(vec2 co) {
    return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    float x = pos.x;
    float y = pos.y;

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

    simplex.x = noiseb + noisem + noiset;
}
