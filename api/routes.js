"use strict";

const getAll = require('./getAll')
const path = require('path')

module.exports = function(app) {
  app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/../public/index.html'))
  })
  app.post("/get-all", getAll)
}
