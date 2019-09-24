var Instagrapper = require('../src')

module.exports = (socket, io) => {
  socket.on('getAll', async(obj) => {
    const instagrapper = new Instagrapper()
    const igProxy = new Proxy(instagrapper, {
      set(obj, prop, value) {
        if (prop === 'status') {
          io.to(socket.id).emit('progress', value)
        }
        return Reflect.set(obj, prop, value)
      }
    })
    const archive = await instagrapper.init(obj, igProxy)
    io.to(socket.id).emit('done', archive)
  })
}