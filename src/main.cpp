#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>

#include "include/GL.hpp"
#include "include/GLFW.hpp"

int main(int argc, char* argv[]) {
    GLFW::init();
    GLFW::setGLVersion(3, 3);

    GLFW::Window window(800, 600, "Memes");

    glewExperimental = GL_TRUE;
    glewInit();

    while ( !window.shouldClose() ) {
        printf("%f %f\n", window.getCursorPos().x, window.getCursorPos().y);
        window.swapBuffers();
    }

    GLFW::terminate();

    return 0;
}
