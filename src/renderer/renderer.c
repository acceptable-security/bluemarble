#include "../terrain/random.h"
#include "../terrain/cellular_noise.h"
#include "../terrain/simplex_noise.h"

#include "renderer.h"

#include <stdlib.h>
#include <stdio.h>

renderer_t* renderer_init(int width, int height) {
    renderer_t* renderer = (renderer_t*) malloc(sizeof(renderer_t));

    if ( renderer == NULL ) {
        return NULL;
    }

    if ( !glfwInit() ) {
        fprintf(stderr, "Failed to initialize GLFW\n");
        return NULL;
    }

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_RESIZABLE, GL_FALSE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // 4x antialiasing
    glfwWindowHint(GLFW_SAMPLES, 4);

    // Open a window and create its OpenGL context
    renderer->window = glfwCreateWindow(width, height, "BlueMarble Renderer", NULL, NULL);

    if ( renderer->window == NULL ) {
        free(renderer);
        glfwTerminate();

        fprintf(stderr, "Failed to open GLFW window.\n");
        return NULL;
    }

    glfwMakeContextCurrent(renderer->window);
    glfwSetKeyCallback(renderer->window, renderer_keyboard_event);

    // Initialize GLEW
    glewExperimental = GL_TRUE;

    if ( glewInit() != GLEW_OK ) {
        free(renderer);
        glfwTerminate();

        fprintf(stderr, "Failed to initialize GLEW");
        return NULL;
    }

    // Scale to window size
    glfwGetWindowSize(renderer->window, &renderer->width, &renderer->height);
    glViewport(0, 0, renderer->width, renderer->height);

    // Get info of GPU and supported OpenGL version
    printf("Renderer: %s\n", glGetString(GL_RENDERER));
    printf("OpenGL version supported %s\n", glGetString(GL_VERSION));

    // Depth Testing
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LEQUAL);
    glDisable(GL_CULL_FACE);
    glCullFace(GL_BACK);

    return renderer;
}

void renderer_keyboard_event(GLFWwindow* window, int key, int scancode, int action, int mods) {
    if ( action == GLFW_PRESS ) {
        switch ( key ) {
            case GLFW_KEY_ESCAPE:
                glfwSetWindowShouldClose(window, GL_TRUE);
                break;

            default:
                break;
        }
    }
}

void renderer_generate_terrain(renderer_t* renderer, unsigned int width, unsigned int height) {
    renderer->terrain = terrain_init(width, height);

    terrain_fill_map(renderer->terrain);
    terrain_hydraulic_erosion(renderer->terrain, 200);
    terrain_thermal_erosion(renderer->terrain, 50, true);
}

void renderer_generate_vertices(renderer_t* renderer) {
    unsigned int width = renderer->terrain->map->width;
    unsigned int height = renderer->terrain->map->height;

    renderer->colors = (float*) malloc(sizeof(float) * (width * height * 3));
    renderer->indices = (unsigned short*) malloc(sizeof(unsigned short) * (width * height * 4));

    for ( int x = 0; x < width - 1; x++ ) {
        for ( int y = 0; y < height - 1; y++ ) {
            renderer->indices[4 * ((y * width) + x) + 0] = (y * width) + x;
            renderer->indices[4 * ((y * width) + x) + 1] = (y * width) + (x + 1);
            renderer->indices[4 * ((y * width) + x) + 2] = ((y + 1) * width) + (x + 1);
            renderer->indices[4 * ((y * width) + x) + 3] = ((y + 1) * width) + x;
        }
    }

    glGenVertexArrays(1, &renderer->vao);
    glBindVertexArray(renderer->vao);

    glGenBuffers(1, &renderer->vbo);
    glBindBuffer(GL_ARRAY_BUFFER, renderer->vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float) * width * height, renderer->terrain->map->data, GL_STATIC_DRAW);

    glGenBuffers(1, &renderer->ibo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, renderer->ibo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(int) * (width * height * 4), renderer->indices, GL_STATIC_DRAW);
}

void renderer_render_terrain(renderer_t* renderer) {

}

void renderer_render(renderer_t* renderer) {
    // Draw stuff
    glClearColor(0.0, 0.8, 0.3, 1.0);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    glMatrixMode(GL_PROJECTION_MATRIX);
    glLoadIdentity();
    gluPerspective(60, (double)renderer->width / (double)renderer->height, 0.1, 100);

    glMatrixMode(GL_MODELVIEW_MATRIX);
    glTranslatef(0,0,-5);

    renderer_render_terrain(renderer);
}

void renderer_display(renderer_t* renderer) {
    while ( !glfwWindowShouldClose(renderer->window) ) {
        // Check for any input, or window movement
        glfwPollEvents();

        renderer_render(renderer);

        // Update Screen
        glfwSwapBuffers(renderer->window);
    }
}

void renderer_clean(renderer_t* renderer) {
    if ( renderer == NULL ) {
        return;
    }

    if ( renderer->window != NULL ) {
        glfwDestroyWindow(renderer->window);
        glfwTerminate();
    }

    terrain_clean(renderer->terrain);

    if ( renderer->colors != NULL ) {
        free(renderer->colors);
    }

    if ( renderer->indices != NULL ) {
        free(renderer->indices);
    }

    free(renderer);
}

int renderer(int argc, char** argv) {
    renderer_t* renderer = renderer_init(1024, 620);

    if ( renderer != NULL ) {
        renderer_display(renderer);
    }

    renderer_clean(renderer);

    return 0;
}
