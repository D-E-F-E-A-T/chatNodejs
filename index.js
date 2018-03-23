var app = require('./config/custom-express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cluster = require('cluster');

var numWorkers = process.env.WEB_CONCURRENCY || 1;
console.log(numWorkers);

if(cluster.isMaster){
    for(var i = 0; i<numWorkers; i++){
        cluster.fork();
    }

    cluster.on('listening', function(worker){
        console.log('cluster conected: '+worker.process.pid);
    });

    cluster.on('exit', function(){
        cluster.fork();
    });
}else{
    app.set('io', io);
    
    var port = process.env.PORT || 3000;
    var server = http.listen(port, function(){
        if(!process.env.NODE_ENV){
            console.log('chat version 1.0 running on '+port);
        }
    });
}