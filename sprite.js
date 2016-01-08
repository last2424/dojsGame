var position;
var width;
var height;
var url;
var isPlayer;

var isUp = false;
var isDown = false;
var isLeft = false;
var isRight = false;
var id;
var name;

function Sprite(url, vec, width, height, isPlayer){
	this.url = url;
	this.position = vec;
	this.width = width;
	this.height = height;
	this.isPlayer = isPlayer;
}
Sprite.prototype.drawMe = function(ctx) {
ctx.drawImage(this.url, this.position.x, this.position.y, this.width, this.height);	
}

Sprite.prototype.draw = function(ctx, x, y) {
ctx.drawImage(this.url, x, y, this.width, this.height);	
}