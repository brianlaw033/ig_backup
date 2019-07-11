const scrapper = require('../main')

const getAll = async(req, res) => {
  const archive = await scrapper(req.body)
  res.download(archive)
}

module.exports = getAll