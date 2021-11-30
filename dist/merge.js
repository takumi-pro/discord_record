"use strict";
var fs = require('fs'), chunks = fs.readdirSync(__dirname + '/../recordings'), inputStream, currentfile, outputStream = fs.createWriteStream(__dirname + '/../recordings/merge.pcm');
chunks.sort(function (a, b) { return a - b; });
function appendFiles() {
    if (!chunks.length) {
        outputStream.end(function () { return console.log('Finished.'); });
        return;
    }
    currentfile = "".concat(__dirname, "/../recordings/") + chunks.shift();
    inputStream = fs.createReadStream(currentfile);
    inputStream.pipe(outputStream, { end: false });
    inputStream.on('end', function () {
        console.log(currentfile + ' appended');
        appendFiles();
    });
}
appendFiles();
