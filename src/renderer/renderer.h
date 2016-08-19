#ifndef RENDERER_H
#define RENDERER_H

#include <GL/glew.h>
#include <GLFW/glfw3.h>

#include <stdbool.h>

#include "../terrain/map.h"
#include "../terrain/terrain.h"

typedef struct {
    GLFWwindow* window;
    int width;
    int height;

    terrain_t* terrain;

    float* colors;
    unsigned short* indices;

    GLuint vao;
    GLuint vbo;
    GLuint ibo;

    GLuint shaderProgram;
} renderer_t;

renderer_t* renderer_init(const int width, const int height);
char* renderer_read_file(const char* path);
bool renderer_compile_shader(renderer_t* renderer, const char* vertexShaderPath, const char* fragmentShaderPath);
void renderer_keyboard_event(GLFWwindow* window, int key, int scancode, int action, int mods);
void renderer_generate_terrain(renderer_t* renderer, unsigned int width, unsigned int height);
void renderer_generate_vertices(renderer_t* renderer);
void renderer_render_terrain(renderer_t* renderer);
void renderer_render(renderer_t* renderer);
void renderer_display(renderer_t* renderer);
void renderer_clean(renderer_t* renderer);

#endif
