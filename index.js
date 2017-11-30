var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

const gameloop = require('node-gameloop');

var players = [];

server.listen(8080, function() {
    console.log("Server is now running...");
});

io.on('connection', function(socket){
    console.log("Player " + socket.id + " Connected!");
    socket.emit('socketID', {id:socket.id});
    socket.emit('getPlayers', players);
    socket.broadcast.emit('newPlayer', {id:socket.id});

    socket.on('pingRequest', function(data) {
	    console.log("Player "+socket.id +" request ping at "+ data.requested);
	    var d = new Date();
        var now = d.getTime();
	    data.responded = now;
	    socket.emit('pingRequest', data);
    });


    socket.on('playerMoved', function(data) {
        data.id = socket.id;
        socket.broadcast.emit('playerMoved', data);

        for(var i = 0; i < players.length; i++) {
            if(players[i].id == data.id) {
                players[i].x = data.x;
                players[i].z = data.z;
                players[i].kpx = data.kpx;
                players[i].kpy = data.kpy;
            }
        }
    });


    socket.on('disconnect', function(){
        console.log("Player " + socket.id + " Disconnected!");
        socket.broadcast.emit('playerDisconnected', {id:socket.id});
        for(var i = 0; i < players.length; i++) {
            if(players[i].id == socket.id) {
                players.splice(i, 1);
            }
        }
    });
    players.push(new player(socket.id, 0, 0, 0, 0));
});

function player(id, x, z, kpx, kpy) {
    this.id = id;
    this.x = x;
    this.z = z;
    this.kpx = kpx;
    this.kpy = kpy;
}


 
// start the loop at 30 fps (1000/30ms per frame) and grab its id 
let frameCount = 0;
const id = gameloop.setGameLoop(function(delta) {
    // `delta` is the delta time from the last frame 
//    console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
}, 1000 / 30);
 
// stop the loop 2 seconds later 
//setTimeout(function() {
//    console.log('2000ms passed, stopping the game loop');
//    gameloop.clearGameLoop(id);
//}, 2000);


