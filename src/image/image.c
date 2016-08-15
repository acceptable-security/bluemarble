
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

#include "image.h"

#include <stdlib.h>
#include <string.h>
#include <math.h>

#define max(a, b) a > b ? a : b
#define min(a, b) a < b ? a : b

color_t lerp(color_t c1, color_t c2, float v) {
    color_t out;

    // v = min(-10.0, max(10.0, v));

    out.r = (unsigned char) (((float) c1.r * (1.0f - v)) + (((float) c2.r) * v));
    out.g = (unsigned char) (((float) c1.g * (1.0f - v)) + (((float) c2.g) * v));
    out.b = (unsigned char) (((float) c1.b * (1.0f - v)) + (((float) c2.b) * v));

    return out;
}

image_t* image_init(unsigned int width, unsigned int height) {
    image_t* image = (image_t*) malloc(sizeof(image_t));

    if ( image == NULL ) {
        return NULL;
    }

    image->width = width;
    image->height = height;
    image->color_data = (unsigned char*) malloc(sizeof(unsigned char) * 3 * (width * height));

    memset(image->color_data, 0, sizeof(unsigned char) * 3 * (width * height));

    if ( image->color_data == NULL ) {
        free(image);
        return NULL;
    }

    return image;
}

void image_set(image_t* image, unsigned int x, unsigned int y, color_t color) {
    image->color_data[3 * ((y * image->width) + x) + 0] = (unsigned char) color.r;
    image->color_data[3 * ((y * image->width) + x) + 1] = (unsigned char) color.g;
    image->color_data[3 * ((y * image->width) + x) + 2] = (unsigned char) color.b;
}

void image_write(image_t* image, const char* path) {
    stbi_write_bmp(path, image->width, image->height, 3, image->color_data);
}

void image_clean(image_t* image) {
    if ( image == NULL ) {
        return;
    }

    if ( image->color_data != NULL ) {
        free(image->color_data);
    }

    free(image);
}
