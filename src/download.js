const rp = require('request-promise');
const fs = require("fs");

const download = async(uri, filename) => {
  await new Promise(resolve => {
    try {
      rp(uri)
      .pipe(fs.createWriteStream(filename))
      .on("finish", resolve)
    } catch (err) {
      console.log(err)
    }
  })
}

module.exports = download