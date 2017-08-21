#version 330 core

layout (location = 0) in vec3 position;
out float scale;
out float height;

void main() {
    scale = 1.0;
    gl_Position = vec4(position.x - 6, position.y, position.z, 1.0);
    height = position.z;
}
