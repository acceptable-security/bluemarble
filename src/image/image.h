#ifndef IMAGE_H
#define IMAGE_H

typedef struct {
    unsigned char r;
    unsigned char g;
    unsigned char b;
} __attribute__((__packed__)) color_t;

#define COLOR(R, G, B) (color_t) { .r = R, .g = G, .b = B}

typedef struct {
    unsigned int width;
    unsigned int height;
    unsigned char* color_data;
} image_t;

image_t* image_init(unsigned int width, unsigned int height);
void image_set(image_t* image, unsigned int x, unsigned int y, color_t color);
void image_write(image_t* image, const char* path);
void image_clean(image_t* image);

color_t lerp(color_t c1, color_t c2, float v);

#endif
