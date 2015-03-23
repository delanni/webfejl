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
		var mousePos = new Vector(mouse.x,mouse.y);

		for(var i=0; i< world.entities.length; i++){
			var entity = world.entities[i];
			if (entity instanceof Square){
				// Fizikához közelebbi hatás eléréséhez ne a sebesség, hanem a gyorsulás legyen adott
				entity.acceleration = mousePos.subtract(entity.position);
			}
		}
	}
};

var colors = ["#a171ca", "#0a46c1", "#99ea49", "#abac0a"];
var squares = [];
for(var i=0; i<50; i++){
	var sq = squares[i] = new Square(Math.random()*cWidth,Math.random()*cHeight, {
		size:15,
		color:colors[i%4],
		friction: Math.random()*0.01
	});
	world.insert(sq,true, true);
}

var lastT = 0;
var gameLoop = function(t){
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