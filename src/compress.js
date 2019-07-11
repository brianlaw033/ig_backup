const fs = require("fs");
const archiver = require('archiver');

const compress = async(args) => {
  const output = fs.createWriteStream(`outputs/${args.target}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 9 }
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function(err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(`img/${args.target}/`, args.target)
  await archive.finalize()
}

module.exports = compress