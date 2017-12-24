var app = require('./config/custom-express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('io', io);

var port = process.env.PORT || 3000;
var server = http.listen(port, function(){

});