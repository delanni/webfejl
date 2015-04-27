// Konstruktor függvény definiálásával kezdjük

var Vector = function(x,y){
	this.x = x || 0;
	this.y = y || 0;
};

// Vektorműveletek definiálása a prototípuson

// Pl. a vektor eltolása
Vector.prototype.addInPlace = function(other){
	this.x += other.x;
	this.y += other.y;
	return this;
};

// Véletlenszerű vektor generálása
Vector.random = function(scaleX, scaleY){
	if (arguments.length == 0){
		scaleX = scaleY = 1;
	} else if (arguments.length == 1){
		scaleY = scaleX;
	}

	return new Vector((Math.random()-0.5)*scaleX,(Math.random()-0.5)*scaleY);
};