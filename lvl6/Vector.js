// Konstruktor függvény definiálásával kezdjük

var Vector = function(x,y){
	this.x = x || 0;
	this.y = y || 0;
};

// Vektorműveletek definiálása a prototípuson
Vector.prototype.add = function(other){
	return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.addInPlace = function(other){
	this.x += other.x;
	this.y += other.y;
	return this;
};

Vector.prototype.scale = function(scaler){
	return new Vector(this.x * scaler, this.y * scaler);
};

Vector.prototype.scaleInPlace = function(scaler){
	this.x *= scaler;
	this.y *= scaler;
	return this;
};

Vector.prototype.length = function(){
	return Math.sqrt(this.x*this.x + this.y*this.y);
};

Vector.random = function(scaleX, scaleY){
	if (arguments.length == 0){
		scaleX = scaleY = 1;
	} else if (arguments.length == 1){
		scaleY = scaleY;
	}

	return new Vector((Math.random()-0.5)*scaleX,(Math.random()-0.5)*scaleY);
};