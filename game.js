var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);

var textariaChat = document.getElementById("chat");
var textariaInput = document.getElementById("input");
var textariaButton = document.getElementById("sumbit");
var iFocus = false;
 
var lastTime;
var player;
var playerPosition = new Vector(0, 0);
var playerVelocity = new Vector(0, 0);
var cameraPosition = new Vector(0, 0);
var mapHeight = 1000;
var mapwidth = 1000;
var IsGround = false;
var ground = [];
var MaxSpeed= new Vector(3,10);
var socket;
var clientID = 0;

var online_player = [];

var fps = 0;
var fpsInterval = 500;
var ping = 0;
var pingTime;

	resources.load([
    'tileground.png'
	]);
	resources.onReady(init);

window.onload = function() {
	document.addEventListener("keydown", checkKeyDown, false);
    document.addEventListener("keyup", checkKeyUp, false);
	socket = io.connect("http://52.30.238.94:8080");
	socket.on('connect', SocketOpen);
	socket.on('message', SocketMessage);
	
};
window.setInterval('socket.send("Players position")', 0);
window.setInterval('socket.send("x:"+player.position.x+":y:"+player.position.y+":id:"+clientID)', 0);
window.setInterval(function() {
	pingTime = Date.now();
	socket.send('ping');
}, 2000);

function init() {
    player = new Sprite(resources.get("tileground.png"), playerPosition, 32, 32, true);
    for(var i = 0; i < 64; i++){
    ground[i] = new Sprite(resources.get("tileground.png"), new Vector(16*i, 100), 16, 16, false);
    }
    lastTime = Date.now();
    main();
}

function createShadow(id, name){
	var shadow = new Sprite(resources.get("tileground.png"), new Vector(0, 0), 32, 32, false);
	shadow.position.x = 0;
	shadow.position.y = 0;
	shadow.id = id;
	return shadow;
}
 
function main() {
    var now = Date.now();
    var dt = (now - lastTime) /fpsInterval;
   
	fps = 1/dt;
	
    update(dt);
    render(dt);
   
    lastTime = now;
    requestAnimationFrame(main);
}
 
function update(dt) {
    cameraPosition = new Vector(player.position.x,player.position.y);
    cameraPosition.x -= canvas.width/2-32;
    cameraPosition.y -= canvas.height/2-32;
   if(cameraPosition.x < 0 ) cameraPosition.x = 0
  else if(cameraPosition.x>mapwidth-canvas.width ) cameraPosition.x = mapwidth-canvas.width
   if(cameraPosition.y < 0 ) cameraPosition.y = 0
  else if(cameraPosition.y>mapHeight-canvas.height ) cameraPosition.y = mapHeight-canvas.height
    moveInit(dt);
	if(fps < 25){
		fpsInterval += 200;
	}
	if(fps > 35) {
		fpsInterval -= 200;
	}
}
 
function moveInit(dt) {
	var temp = new Vector(player.position.x,player.position.y);
	if(player.isPlayer){
        if(player.isLeft){
            playerVelocity.x -= 2*dt;
			if(playerVelocity.x <= -MaxSpeed.x) playerVelocity.x=-MaxSpeed.x;
        }
        if(player.isRight){
            playerVelocity.x += 2*dt;
			if(playerVelocity.x >= MaxSpeed.x) playerVelocity.x=MaxSpeed.x;
		}
		temp.x+=playerVelocity.x;
		if(playerVelocity.x < -0) playerVelocity.x+=1*dt;
		else if(playerVelocity.x > 0)playerVelocity.x-=1*dt;
		else playerVelocity.x = 0;
		if(player.isUp && IsGround){//если игрок стоит на земле и нажимает W,то 
				playerVelocity.y=-3;//делаем ему отрицательную вертикальную скорость, что бы он подпрыгнул, так как положительное это вниз
			}
		var IsColX = false;
		for(var i = 0; i < 64; i++){
		if(temp.x+30 >= ground[i].position.x && temp.x <= ground[i].position.x+16 &&
			temp.y+30 >= ground[i].position.y && temp.y <= ground[i].position.y+16 
			)
			{
				IsColX = true;//игрок столкнулся горизонтальн о
				playerVelocity.x = 0;
				break;
			}
		}
		/*	for(var i = 0; i < online_player.length; i++){
			if(online_player[i].id != clientID ){
				if(temp.x+30 >= online_player[i].x && temp.x <= online_player[i].x+30 &&
					temp.y+30 >= online_player[i].y && temp.y <= online_player[i].y+30 
				){
					IsColX = true;//игрок столкнулся горизонтальн о
					playerVelocity.x = 0;
					break;
					}
				}
		}*/
		if(!IsGround){//если не на земле
			temp.y+=playerVelocity.y;//то опускаем игрока с вертикальной скоростью
			playerVelocity.y+=6*dt;
			if(playerVelocity.y >= MaxSpeed.y) playerVelocity.y=MaxSpeed.y;
		}
		if(!IsColX){//если не сталкивается горизонтально
			IsGround = false;
			for(var i = 0; i < 64; i++){
			if(temp.x+30 >= ground[i].position.x && temp.x <= ground[i].position.x+16 &&
				temp.y+30 >= ground[i].position.y && temp.y <= ground[i].position.y+16 
				)
				{//ну сталкивается вертикально
					IsGround = true;//то игрок не земле
					playerVelocity.y=0;
					break;
				}
			}
	/*		for(var i = 0; i < online_player.length; i++){
			if(online_player[i].id != clientID ){
				if(temp.x+30 >= online_player[i].x && temp.x <= online_player[i].x+30 &&
					temp.y+30 >= online_player[i].y && temp.y <= online_player[i].y+30 
				)	{
					IsGround = true;//то игрок не земле
					playerVelocity.y=0;
					break;
					}
				}
	}*/
		}
		if(temp.x  < 0)temp.x = 0;
		if(temp.x  > mapwidth-32)temp.x = mapwidth-32;
		if(temp.y  < 0)temp.y = 0;
		if(temp.y  > mapHeight -32)temp.y = mapHeight -32;
		if(!IsColX) player.position.x = temp.x;
		if(!IsGround)player.position.y = temp.y;
	}
}
 
function checkKeyDown(e){
    var keyID = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyID);
	//socket.send('x:'+player.position.x+':y:'+player.position.y+":id:"+clientID);
	if(!iFocus){
    if(keyChar == "W")
    {
        player.isUp = true;
        e.preventDefault();
    }
   
    if(keyChar == "S")
    {
        player.isDown = true;
        e.preventDefault();
    }
   
    if(keyChar == "A")
    {
        player.isLeft = true;
        e.preventDefault();
    }
   
    if(keyChar == "D")
    {
        player.isRight = true;
        e.preventDefault();
    }
	
	if(keyChar == "I")
    {
        e.preventDefault();
    }
	if(keyChar == "K")
    {
        e.preventDefault();
    }
	}
}
 
function checkKeyUp(e){
    var keyID = e.keyCode || e.which;
    var keyChar = String.fromCharCode(keyID);
    //socket.send('x:'+player.position.x+':y:'+player.position.y+":id:"+clientID);
	if(!iFocus){
    if(keyChar == "W")
    {
        player.isUp = false;
        e.preventDefault();
    }
   
    if(keyChar == "S")
    {
        player.isDown = false;
        e.preventDefault();
    }
   
    if(keyChar == "A")
    {
        player.isLeft = false;
        e.preventDefault();
    }
   
    if(keyChar == "D")
    {
        player.isRight = false;
        e.preventDefault();
    }
	}
}
 
function render(dt) {
	ctx.strokeStyle="#FFFFFF";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx, player.position.x-cameraPosition.x, player.position.y-cameraPosition.y);
    for(var i = 0; i < 64; i++){
    ground[i].draw(ctx, ground[i].position.x-cameraPosition.x,ground[i].position.y-cameraPosition.y);
    }
	
	for(var i = 0; i < online_player.length; i++){
	online_player[i].draw(ctx, online_player[i].x-cameraPosition.x, online_player[i].y-cameraPosition.y);
	ctx.strokeText(online_player[i].name, online_player[i].x-cameraPosition.x, (online_player[i].y-20)-cameraPosition.y);
	}
	ctx.strokeText("Fps: "+Math.round(fps), 20, 20);
	ctx.strokeText("Resource Count Loaded: "+resourcesLoaded, 20, 40);
	ctx.strokeText("Ping: "+ping, 20, 60);
}

function SocketOpen() {
}

function SocketError() {
	
}

function SocketMessage(e) {
	if(e.event == "connected"){
		if(clientID == 0){
			clientID = e.id;
			console.log(clientID);
			socket.send("Connect:"+IP+":ID:"+clientID);
			playerPosition.x+= 32;
		}
	}
	if(e == "pong") {
		ping = Date.now() - pingTime;
	}
	
	if(e.event == "messageSend"){
		document.getElementById('chat').value += e.name+": "+e.message+"\n";
	}
	if(e.event == "playerPosition"){
		if(clientID != e.id){
			for(var i = 0; i < online_player.length; i++){
			if(online_player[i].id == e.id){
				online_player[i].x = e.x;
				online_player[i].y = e.y;
				online_player[i].name = e.name;
				break;
				continue;
			}
			}
			online_player.push(createShadow(e.id));
			online_player[i].x = e.x;
			online_player[i].y = e.y;
			online_player[i].name = e.name;
		}
	}
	
	if(e.event == "userLeft"){
		for(var i = 0; i < online_player.length; i++){
		if(online_player[i].id == e.id){
			console.log("Disconnect: "+online_player[i].id);
			online_player.splice(i, 1);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			break;
			}
		}
	}
}



