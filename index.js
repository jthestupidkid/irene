var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  // res.send('Black Tea Technologies–Not serving tea since 2015');
  res.sendFile(__dirname + '/index.html');
});

var server = app.listen(8001);