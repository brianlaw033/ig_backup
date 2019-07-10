const express = require('express')
const app = express();
const port = process.env.PORT || 8964;

const routes = require('./api/routes');

app.use(express.json())

routes(app);
app.listen(port, function() {
  console.log('Server started on port: ' + port);
});