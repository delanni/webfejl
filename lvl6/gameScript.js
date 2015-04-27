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
	},
	handleInputs : function(mouse,keyboard){
		// Ő kapja meg az egér állapotát, és tesz vele valamit
		// Pl. feléje mozgatja a részecskéket

		// Először vegyük az egérpozíció helyvektorát
		var mousePos = new Vector(mouse.x,mouse.y);

		// Iteráljunk végig az összes elemen
		for(var i=0; i< world.entities.length; i++){
			// Vegyük ki az aktuális elemet
			var entity = world.entities[i];
			// S ha ez az elem bizony egy négyzet
			if (entity instanceof Square){
				// Akkor annak sebessége legyen a pozíciójából az egér helyvektorához húzott vektor
				// Ezt vektoralgebrában egyszerű kivonással megoldhatjuk
				entity.speed = mousePos.subtract(entity.position);
			}
		}
	}
};

// Tartsuk meg csak a véletlenszerűen generált elemeket
var colors = ["#a171ca", "#0a46c1", "#99ea49", "#abac0a"];
var squares = [];
for(var i=0; i<50; i++){
	var sq = squares[i] = new Square(Math.random()*cWidth,Math.random()*cHeight, 15, colors[i%4]);
	world.insert(sq,true, true);
}

var lastT = 0;
var gameLoop = function(t){
	// Számoljuk ki mennyi ideig futott a legutóbbi render ciklus
	if (lastT == 0){
		var delta=60/1000;
		lastT = t;
	} else {
		delta = t - lastT;
		lastT = t;
	}
	
	window.requestAnimationFrame(gameLoop);
	
	clearCtx();

	/** Minden szimuláció előtt lefuttatjuk az input kezelő függvényt **/
	world.handleInputs(mouse,keyboard);

	world.simulate(delta);

	for(var i=0;i<world.drawables.length;i++){
		var drawable = world.drawables[i];
		drawable.drawTo(ctx);
	}
};

/** Feliratkozunk mindenféle egér eseményekre, aminek állapotát tároljuk egy állapotváltozóban **/
var mouse = {
	x:0,
	y:0,
	left:false,
	right:false
};
canvas.onmousemove = function(ev){
    var rect = canvas.getBoundingClientRect();
	mouse.x = ev.offsetX || ev.clientX - rect.left;
	mouse.y = ev.offsetY || ev.clientY - rect.top;
};
/** Megelőlegezhetjük ezt a billentyűzetre is **/
var keyboard = {};

window.requestAnimationFrame(gameLoop);