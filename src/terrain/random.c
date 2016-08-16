#include <stdlib.h>

int permutations[256];

// Generate permutations
void permutations_generate() {
    for ( int i = 0; i < 256; i++ ) {
        permutations[i] = i;
    }

    for ( int i = 0; i < 256; i++ ) {
        int j = permutations[i];
        int k = rand() % 256;

        permutations[i] = permutations[k];
        permutations[k] = j;
    }
}

// Generate a random number based off of two other numbers.
float random2(int x, int y) {
    return permutations[((x + permutations[y & 255]) & 255)] & 7;
}

// Generate a random number based off of three other numbers.
float random3(int x, int y, int z) {
    return permutations[(x + permutations[(y + permutations[z & 255]) & 255]) & 255] / 256.0f;
}
