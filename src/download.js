const rp = require('request-promise');
const fs = require("fs");

const download = (uri, filename) => {
  return new Promise((resolve, reject) => {
    rp(uri)
    .pipe(fs.createWriteStream(filename))
    .on("finish", resolve)
    .on('error', function(err) {
      console.log({ uri, err })
      reject
    })
  })
}

module.exports = download