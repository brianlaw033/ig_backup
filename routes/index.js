var express = require('express');
var path = require('path')

require('../socket')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname + '/../public/index.html'))
});

router.post("/download", (req, res) => {
  res.download(req.body.location)
})

module.exports = router;
