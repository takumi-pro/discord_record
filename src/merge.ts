let fs = require('fs'),
    chunks = fs.readdirSync(__dirname + '/../recordings'),
    inputStream,
    currentfile: string,
    outputStream = fs.createWriteStream(__dirname + '/../recordings/merge.pcm');

chunks.sort((a: number, b: number) => { return a - b; });

function appendFiles() {
    if (!chunks.length) {
        outputStream.end(() => console.log('Finished.'));
        return;
    }

    currentfile = `${__dirname}/../recordings/` + chunks.shift();
    inputStream = fs.createReadStream(currentfile);

    inputStream.pipe(outputStream, { end: false });

    inputStream.on('end', function() {
        console.log(currentfile + ' appended');
        appendFiles();
    });
}

appendFiles();

