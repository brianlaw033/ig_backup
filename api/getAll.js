const Instagrapper = require('../main')

const getAll = async(req, res) => {
  const archive = await new Instagrapper().init(req.body)
  console.log('Sending zip file...')
  res.download(archive)
}

module.exports = getAll