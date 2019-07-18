const Instagrapper = require('../main')

const getAll = async(req, res) => {
  req.connection.setTimeout(60 * 10 * 1000);
  const archive = await new Instagrapper().init(req.body)
  console.log('Sending zip file...')
  res.download(archive)
}

module.exports = getAll