const path = require('path');
const fs = require('fs');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
    });

    return filelist;
};

const shaders = walkSync('./terrain');

console.log('Found', shaders);

const obj = {};

shaders.map(path => {
    if ( path.indexOf('DS_Store') >= 0 ) return;
    obj[path] = fs.readFileSync(path).toString();
});

fs.writeFileSync('shaders.js', `const shaders = ${JSON.stringify(obj, 0, 4)};`);