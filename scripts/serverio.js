var io = require("socket.io").listen(8080);
var prClass = require("./Player");

io.set('log level', 1);


var clients =  0;
var online_players = [];
// Scream server example: "hi" -> "HI!!!" 
io.sockets.on('connection', function (socket) {
	console.log("New connection");
	clients += 1;
	socket.json.send({'event': 'connected', 'id':(socket.id).toString().substr(0, 5)});
	online_players.push(new prClass.Player((socket.id).toString().substr(0, 5)));
	socket.broadcast.json.send({'event': 'userJoined', 'id':(socket.id).toString().substr(0, 5)});
	socket.on('message', function(msg) {
		var splitString = msg.split(":");
		if(splitString[0] == "x" && splitString[2] == "y"){
			for(var i = 0; i < online_players.length; i++){
				if(online_players[i].id == splitString[5]){
					online_players[i].x = splitString[1];
					online_players[i].y = splitString[3];
					continue;
				}
			}
		}
		
		if(splitString[0] == "Players position") {
			for(var i = 0; i < online_players.length; i++){
				socket.json.send({'event':'playerPosition', 'id':online_players[i].id, 'x':online_players[i].x, 'y':online_players[i].y, 'name':online_players[i].name});
			}	
		}
		
		if(splitString[0] == "Connect"){
			for(var i = 0; i < online_players.length; i++){
				if(online_players[i].id == splitString[3]){
					online_players[i].ip = splitString[1];
				}
			}
		}
		
		if(splitString[0] == "UpdateName"){
			for(var i = 0; i < online_players.length; i++){
				if(online_players[i].id == splitString[3]){
					online_players[i].name = splitString[1];
				}
			}
		}
		
		if(splitString[0] == "Message"){
			console.log(splitString[3]+": "+splitString[1]);
			socket.json.send({'event': 'messageSend', 'message':splitString[1], 'name':splitString[3]});
			socket.broadcast.json.send({'event': 'messageSend', 'message':splitString[1], 'name':splitString[3]});
		}
		
		if(splitString[0] == "ping"){
			socket.send("pong"+io.sockets.ping);
		}
	});
	
	socket.on('disconnect', function() {
		console.log("Connection closed"+(socket.id).toString().substr(0, 5));
		clients -= 1;
		for(var i = 0; i < online_players.length; i++){
		if(online_players[i].id == (socket.id).toString().substr(0, 5))
		online_players.splice(i, 1);
		}
		io.sockets.json.send({'event': 'userLeft', 'id':(socket.id).toString().substr(0, 5)});
	});
	
});