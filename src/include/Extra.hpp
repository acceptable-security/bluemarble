#pragma once

#include <string>
#include <fstream>
#include <streambuf>

namespace Extra {

// Adapted from stackoverflow (thanks Tyler McHenry) because I'm lazy
std::string readFile(const char* path) {
    std::ifstream inputStream(path);
    std::string str;

    inputStream.seekg(0, std::ios::end);
    str.reserve(inputStream.tellg());
    inputStream.seekg(0, std::ios::beg);

    str.assign((std::istreambuf_iterator<char>(inputStream)),
                std::istreambuf_iterator<char>());

    return str;
}

}
