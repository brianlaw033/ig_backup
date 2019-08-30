const express = require('express')
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const Instagrapper = require('./main')

const port = process.env.PORT || 8964;

const routes = require('./api/routes');

app.use(express.json())
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }))
routes(app);

io.on('connection', socket => {

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
});

http.listen(port, function() {
  console.log('Server started on port: ' + port);
});