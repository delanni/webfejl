var canvas = document.getElementById("gameCanvas");
var cWidth = canvas.width;
var cHeight = canvas.height;

var ctx = canvas.getContext("2d");


var clearCtx = function(){
	ctx.save();
	ctx.fillStyle = "#eeeeee";
	ctx.fillRect(0,0,cWidth,cHeight);
	ctx.restore();
};


var world = {
	// Csináljunk egy függvényt ami egyszerre több helyre is beszúrja az elemet
	insert : function(entity, asDrawable, asAnimatable){
		world.entities.push(entity);
		if (asDrawable) world.drawables.push(entity);
		if (asAnimatable) world.animatables.push(entity);
	},
	entities: [],
	drawables: [],
	animatables: [],
	simulate : function(time){ 
		for(var i=0;i<world.animatables.length;i++){
			var animatable = world.animatables[i];
			animatable.animate(time);
		}
	}
};

// Mi történik ha több négyzetet szeretnénk megjeleníteni?
// Ahhoz, hogy ne kelljen minden objektumot kézzel legyártogatnunk, osztályokat hozunk létre, és azokat példányosítjuk.
// Alapvetően felmerül, hogy akkor a kis négyzethez csináljunk egy osztályt, így őt többször példányosíthatjuk
// Később látni fogjuk, hogy a 2 dimenziós vektor is egy olyan konstrukció ami gyakran jön elő, emiatt és a rajta definiált operációk miatt érdemes osztályba szervezni őt is.
// Tehát két osztályunk lesz: Vector és Square (nagy betűvel jelöljük, hogy a new operátorral kell példányosítani belőle)

// Javascriptben a függvény akár konstruktor függvényként is szolgálhat objektumok gyártására
var Square = function(x,y,size, color){
	this.position = new Vector(x,y);
	this.size = size;
	this.color = color ||  "#eb01aa";
};

// Javascriptben példányszintű függvényeket úgy csinálunk, hogy a konstruáló függvény (a nagy betűs) prototípusán definiálunk függvényeket
Square.prototype.drawTo = function(context){
	context.fillStyle = this.color;
	context.fillRect(this.position.x,this.position.y,this.size, this.size);
};
Square.prototype.animate = function(time){
	this.position.addInPlace(Vector.random());
};

/* Kelleni fog a vektor típus is, ezt egy külön fájlban definiálom a helytakarékosság végett */

// Most már példányosíthatjuk bármilyen paraméterekkel több példányként is a négyzetünk
var square = new Square(100,100,30);
var square2 = new Square(150,150, 20, "#40ef30");

// használjuk a world új függvényét:
world.insert(square,true,true);
world.insert(square2,true,true);

// Akár sok objektumot is beszúrhatunk véletlenszerűen:
for(var i=0; i<50; i++){
	var sq = new Square(Math.random()*cWidth,Math.random()*cHeight, 
			15, "#9999" + Math.floor(Math.random()*10) + Math.floor(Math.random()*10));
	world.insert(sq,true, true);
}


var gameLoop = function(t){
	
	window.requestAnimationFrame(gameLoop);
	
	clearCtx();

	world.simulate(t);

	for(var i=0;i<world.drawables.length;i++){
		var drawable = world.drawables[i];
		drawable.drawTo(ctx);
	}
};

gameLoop();