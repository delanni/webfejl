/**
	Square osztály, a négyzetek reprezentálására.
	Függõség: Vector
*/

var Square = function(x,y,size, color){
	this.position = new Vector(x,y);
	this.size = size;
	this.color = color ||  "#eb01aa";

	this.speed = new Vector();
	this.acceleration = new Vector();
};

Square.prototype.drawTo = function(context){
	context.fillStyle = this.color;
	context.fillRect(this.position.x,this.position.y,this.size, this.size);
};

Square.prototype.animate = function(time){
	// Az animálás függvény ezek után a fizikai törvényeknek nagyjából engedelmeskedve a gyorsulásból számít sebességet, sebességből pedig pozíciót
	this.speed.addInPlace(this.acceleration.scale(time/1000));
	this.position.addInPlace(this.speed.scale(time/1000));
};