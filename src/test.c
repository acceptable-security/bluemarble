#include <math.h>
#include <stdio.h>

float grad[8][2];

// Generate the gradients
void grad_generate() {
    for ( int i = 0; i < 8; i++ ) {
        grad[i][0] = cos(0.785398163 * i);
        grad[i][1] = sin(0.785398163 * i);
    }
}

// Do a dotproduct.
float dot_product1(int i, float x, float y) {
    return grad[i][0] * x + grad[i][1] * y;
}


float dot_product2(int i, float x, float y) {
    float grad_s[8];
    grad_s[0] = 1.0;
    grad_s[1] = 0.70710678146758598750;
    grad_s[2] = 0.00000000079489665423;
    grad_s[3] = -0.70710678034343221743;
    grad_s[4] = -1.0;
    grad_s[5] = -0.70710678259173953553;
    grad_s[6] = -0.00000000238468996268;
    grad_s[7] = 0.70710677921927866940;

    float grad_c[8];
    grad_c[0] = 0.0;
    grad_c[1] = 0.70710678090550915798;
    grad_c[2] = 1.0;
    grad_c[3] = 0.70710678202966281702;
    grad_c[4] = 0.00000000158979330845;
    grad_c[5] = -0.70710677978135549893;
    grad_c[6] = -1.00000000000000000000;
    grad_c[7] = -0.70710678315381647607;

    if ( i == 0 ) {
        return grad_s[0] * x + grad_c[0] * y;
    }
    else if ( i == 1 ) {
        return grad_s[1] * x + grad_c[1] * y;
    }
    else if ( i == 2 ) {
        return grad_s[2] * x + grad_c[2] * y;
    }
    else if ( i == 3 ) {
        return grad_s[3] * x + grad_c[3] * y;
    }
    else if ( i == 4 ) {
        return grad_s[4] * x + grad_c[4] * y;
    }
    else if ( i == 5 ) {
        return grad_s[5] * x + grad_c[5] * y;
    }
    else if ( i == 6 ) {
        return grad_s[6] * x + grad_c[6] * y;
    }
    else if ( i == 7 ) {
        return grad_s[7] * x + grad_c[7] * y;
    }

    return 0.0;
}


int main(int argc, char* argv[]) {
    grad_generate();

    for ( int i = 0; i < 8; i++ ) {
        float a1 = dot_product1(i, 1, 2);
        float a2 = dot_product2(i, 1, 2);
        printf("%f %f\n", a1, a2);
    }
}