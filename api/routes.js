"use strict";

const path = require('path')

module.exports = function(app) {
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../public/index.html'))
  })
  app.post("/download", (req, res) => {
    res.download(req.body.location)
  })
}
