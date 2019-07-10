const rp = require('request-promise');
const fs = require("fs");

const download = (uri, filename, callback) => {
  console.log(`Downloading ${filename}...`)
  return rp.head(uri, (err, res, body) => {
    rp(uri)
    .pipe(fs.createWriteStream(filename))
    .on("close", callback);
  });
}

module.exports = download