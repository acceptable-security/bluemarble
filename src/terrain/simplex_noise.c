#include <math.h>
#include "random.h"

#define general_skew (sqrt(3.0) - 1.0) * 0.5
#define general_unskew (3.0 - sqrt(3.0)) / 6.0

float grad[8][2];

// Generate the gradients
void grad_generate() {
    for ( int i = 0; i < 8; i++ ) {
        grad[i][0] = cos(0.785398163 * i);
        grad[i][1] = sin(0.785398163 * i);
    }
}

// Do a dotproduct.
float dot_product(int i, float x, float y) {
    return grad[i][0] * x + grad[i][1] * y;
}

// Generate the simplex noise data.
float simplex_noise_2d(float x, float y) {
    float skew_value = (x + y) * general_skew;
    float cornerb_x = floor(x + skew_value);
    float cornerb_y = floor(y + skew_value);

    float unskew_value = (cornerb_x + cornerb_y) * general_unskew;

    float disb_x = x - cornerb_x + unskew_value;
    float disb_y = y - cornerb_y + unskew_value;

    float cornerm_x, cornerm_y;

    if ( disb_x > disb_y ) {
        cornerm_x = 1.0f + cornerb_x;
        cornerm_y = cornerb_y;
    }
    else {
        cornerm_x = cornerb_x;
        cornerm_y = 1.0f + cornerb_y;
    }

    float cornert_x = 1.0f + cornerb_x;
    float cornert_y = 1.0f + cornerb_y;

    float dism_x = disb_x - (cornerm_x - cornerb_x) + general_unskew;
    float dism_y = disb_y - (cornerm_y - cornerb_y) + general_unskew;

    float dist_x = disb_x - 1.0f + general_unskew + general_unskew;
    float dist_y = disb_y - 1.0f + general_unskew + general_unskew;

    float gradb = random2(cornerb_x, cornerb_y);
    float gradm = random2(cornerm_x, cornerm_y);
    float gradt = random2(cornert_x, cornert_y);

    float tempdis = 0.5f - (disb_x * disb_x) - (disb_y * disb_y);
    float noiseb;

    if ( tempdis < 0.0f ) {
        noiseb = 0.0f;
    }
    else {
        tempdis *= tempdis;
        noiseb = tempdis * tempdis * dot_product(gradb, disb_x, disb_y);
    }


    tempdis = 0.5f - (dism_x * dism_x) - (dism_y * dism_y);
    float noisem;

    if ( tempdis < 0.0f ) {
        noisem = 0.0f;
    }
    else {
        tempdis *= tempdis;
        noisem = tempdis * tempdis * dot_product(gradm, dism_x, dism_y);
    }

    tempdis = 0.5f - (dist_x * dist_x) - (dist_y * dist_y);
    float noiset;

    if ( tempdis < 0.0f ) {
        noiset = 0.0f;
    }
    else {
        tempdis *= tempdis;
        noiset = tempdis * tempdis * dot_product(gradt, dist_x, dist_y);
    }

    return noiseb + noisem + noiset;
}
