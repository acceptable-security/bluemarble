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
        fprintf(stderr, "Failed to initialize GLFW.\n");
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

        fprintf(stderr, "Failed to initialize GLEW.\n");
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

    // Generate shaders
    renderer_compile_shader(renderer, "./src/renderer/vertexShader.glsl", "./src/renderer/fragmentShader.glsl");

    return renderer;
}

char* renderer_read_file(const char* path) {
    FILE* file = fopen(path, "r");

    if ( file == NULL ) {
        fprintf(stderr, "Failed to open the file `%s`.\n", path);
        return NULL;
    }

    if ( fseek(file, 0, SEEK_END) != 0 ) {
        fprintf(stderr, "Failed to calculate the end of the file `%s`.\n", path);
        fclose(file);
        return NULL;
    }

    long size = ftell(file);

    if ( size == -1 ) {
        fprintf(stderr, "Failed to get the size of the file `%s`.\n", path);
        fclose(file);
        return NULL;
    }

    char* buffer = malloc(sizeof(char) * (size + 1));

    if ( buffer == NULL ) {
        fprintf(stderr, "Failed to allocate space in heap for file `%s`.\n", path);
        fclose(file);
        return NULL;
    }

    if ( fseek(file, 0, SEEK_SET) != 0 ) {
        fprintf(stderr, "Failed to return to the beginning of file `%s`.\n", path);
        fclose(file);
        free(buffer);
        return NULL;
    }

    unsigned long readLen = fread(buffer, sizeof(char), size,file);

    if ( ferror(file) != 0 ) {
        fprintf(stderr, "Failed to read from file `%s`.\n", path);
        fclose(file);
        free(buffer);
        return NULL;
    }

    buffer[readLen++] = '\0';

    fclose(file);

    return buffer;
}

void renderer_compile_shader(renderer_t* renderer, const char* vertexShaderPath, const char* fragmentShaderPath) {
    char* vertexShaderBuffer = renderer_read_file(vertexShaderPath);

    if ( vertexShaderBuffer == NULL ) {
        return;
    }

    char* fragmentShaderBuffer = renderer_read_file(fragmentShaderPath);

    if ( fragmentShaderBuffer == NULL ) {
        free(vertexShaderBuffer);
        return;
    }

    GLint compileSuccess;

    GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, (const char**)&vertexShaderBuffer, NULL);
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &compileSuccess);

    if ( !compileSuccess ) {
        GLchar compileInfo[512];
        glGetShaderInfoLog(vertexShader, 512, NULL, compileInfo);
        fprintf(stderr, "Failed to compile the vertex shader: %s\n",compileInfo);

        free(fragmentShaderBuffer);
        free(vertexShaderBuffer);

        return;
    }

    GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, (const char**)&fragmentShaderBuffer, NULL);
    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &compileSuccess);

    if ( !compileSuccess ) {
        GLchar compileInfo[512];
        glGetShaderInfoLog(fragmentShader, 512, NULL, compileInfo);
        fprintf(stderr, "Failed to compile the fragment shader: %s\n", compileInfo);

        free(fragmentShaderBuffer);
        free(fragmentShaderBuffer);

        return;
    }

    free(fragmentShaderBuffer);
    free(fragmentShaderBuffer);

    renderer->shaderProgram = glCreateProgram();
    glAttachShader(renderer->shaderProgram, vertexShader);
    glAttachShader(renderer->shaderProgram, fragmentShader);
    glLinkProgram(renderer->shaderProgram);

    glGetProgramiv(renderer->shaderProgram, GL_LINK_STATUS, &compileSuccess);

    if ( !compileSuccess ) {
        GLchar compileInfo[512];
        glGetShaderInfoLog(fragmentShader, 512, NULL, compileInfo);
        fprintf(stderr, "Failed to compile the shader program: %s\n", compileInfo);

        glDeleteShader(vertexShader);
        glDeleteShader(fragmentShader);

        return;
    }

    glUseProgram(renderer->shaderProgram);

    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);
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

    if ( renderer->colors == NULL ) {
        fprintf(stderr, "Failed to allocate enough space for the vertices.\n");
        return;
    }

    renderer->indices = (unsigned short*) malloc(sizeof(unsigned short) * (width * height * 4));

    if ( renderer->indices == NULL ) {
        free(renderer->colors);
        fprintf(stderr, "Failed to allocate enough space for the colors.\n");
        return;
    }

    for ( int x = 0; x < width - 1; x++ ) {
        for ( int y = 0; y < height - 1; y++ ) {
            renderer->indices[4 * ((y * width) + x) + 0] = (y * width) + x;
            renderer->indices[4 * ((y * width) + x) + 1] = (y * width) + (x + 1);
            renderer->indices[4 * ((y * width) + x) + 2] = ((y + 1) * width) + (x + 1);
            renderer->indices[4 * ((y * width) + x) + 3] = ((y + 1) * width) + x;
        }
    }

    glGenVertexArrays(1, &renderer->vao);
    glGenBuffers(1, &renderer->vbo);
    glGenBuffers(1, &renderer->ibo);

    glBindVertexArray(renderer->vao);
        glBindBuffer(GL_ARRAY_BUFFER, renderer->vbo);
        glBufferData(GL_ARRAY_BUFFER, sizeof(float) * width * height, renderer->terrain->map->data, GL_STATIC_DRAW);

        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, renderer->ibo);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(int) * (width * height * 4), renderer->indices, GL_STATIC_DRAW);

        glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(GLfloat), (GLvoid*)0);
        glEnableVertexAttribArray(0);
    glBindVertexArray(0);
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
