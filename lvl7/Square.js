/**
	Square osztály, a négyzetek reprezentálására.
	Függõség: Vector
*/

// Az egyre gyarapodó paraméterlista helyett options argumentum objektum
var Square = function(x,y, options){
	// Ha nem volt options megadva, akkor legyen az egy üres objektum
	options = options || {};

	this.position = new Vector(x,y);

	this.size = options.size || 5;
	this.color = options.color ||  "#eb01aa";
	this.speed  = options.speed || new Vector();
	this.acceleration = options.acceleration || new Vector();

	// A valószerűbb viselkedéshez csökkenteni, és korlátozni kell a részecskék sebességét
	this.friction = options.friction || 0.1;
	this.maxSpeed = Square.SPD_MAX;
	this.minSpeed = Square.SPD_MIN;
};

Square.prototype.drawTo = function(context){
	context.fillStyle = this.color;
	context.fillRect(this.position.x,this.position.y,this.size, this.size);
};

Square.prototype.animate = function(time){
	// Az animálás függvény ezek után a fizikai törvényeknek nagyjából engedelmeskedve a gyorsulásból számít sebességet, sebességből pedig pozíciót
	this.speed.addInPlace(this.acceleration.scale(time/1000));

	// Csökkentjük a sebességet a súrlódással, és limitáljuk azt
	this.speed.scaleInPlace(1-this.friction);
	this.speed.clamp(this.minSpeed, this.maxSpeed);

	this.position.addInPlace(this.speed.scale(time/1000));

};

Square.prototype.clone = function() {
	var c = new Square();
	var k = Object.keys(this);
	for (var i = 0 ; i < k.length; i++){
		if (this[k[i]].clone){
			c[k[i]] = this[k[i]].clone();
		} else {
			c[k[i]]=this[k[i]];
		}
	}
};

Square.SPD_MIN = -150;
Square.SPD_MAX = 150;