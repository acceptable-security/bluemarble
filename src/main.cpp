#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>

#include "include/GL.hpp"
#include "include/GLFW.hpp"

int main(int argc, char* argv[]) {
    glfwInit();

    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

    GLFW::Window window(800, 600, "Memes");

    glewExperimental = GL_TRUE;
    glewInit();

    while ( !window.shouldClose() ) {
        printf("%f %f\n", window.getCursorPos().x, window.getCursorPos().y);
        window.swapBuffers();
    }

    glfwTerminate();

    return 0;
}
