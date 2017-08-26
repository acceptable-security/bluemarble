#pragma once
#include <cstdlib>

class MapRandom {
private:
    unsigned int permutations[256];

public:
    MapRandom(unsigned int seed) {
        srand(seed);
        generate_permutations();
    }

    MapRandom() {
        srand(0);
        generate_permutations();
    }

    // Generate the permutations used in randomness
    void generate_permutations() {
        for ( int i = 0; i < 256; i++ ) {
            permutations[i] = i;
        }

        for ( int i = 0; i < 256; i++ ) {
            unsigned int j = permutations[i];
            unsigned int k = rand() % 256;

            permutations[i] = permutations[k];
            permutations[k] = j;
        }
    }

    // Generate a random number based off of two other numbers.
    float get(int x, int y) {
        return permutations[((x + permutations[y & 255]) & 255)] & 7;
    }

    // Generate a random number based off of three other numbers.
    float get(int x, int y, int z) {
        return permutations[(x + permutations[(y + permutations[z & 255]) & 255]) & 255] / 256.0f;
    }
};
