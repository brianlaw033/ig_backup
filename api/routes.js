"use strict";

const getAll = require('./getAll')

module.exports = function(app) {
  app.post("/get-all", getAll)
};
