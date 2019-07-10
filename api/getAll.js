const scrapper = require('../main')

const getAll = (req, res) => {
  scrapper(req.body)
}

module.exports = getAll