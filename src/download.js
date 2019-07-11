const rp = require('request-promise');
const fs = require("fs");

const download = async(uri, filename) => {
  await new Promise(resolve => rp(uri)
    .pipe(fs.createWriteStream(filename))
    .on("finish", resolve)
  )
}

module.exports = download