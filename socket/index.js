var getAll = require('./getAll')

function events(io) {
  io.on('connection', socket => {
    getAll(socket, io)
  });
}

module.exports = events