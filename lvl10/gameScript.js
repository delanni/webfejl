var canvas = document.getElementById("gameCanvas");
var cWidth = canvas.width;
var cHeight = canvas.height;

var ctx = canvas.getContext("2d");


var clearCtx = function() {
	ctx.save();
	ctx.fillStyle = "#eeeeee";
	ctx.fillRect(0, 0, cWidth, cHeight);
	ctx.restore();
};

var world = {
	gravity: new Vector(0, 200),

	insert: function(entity, asDrawable, asAnimatable) {
		entity.world = world;
		world.entities.push(entity);
		if (asDrawable) world.drawables.push(entity);
		if (asAnimatable) world.animatables.push(entity);
	},
	// Ez a függvény képes eltávolítani egy elemet a világ minden referencia tömbjéből
	remove: function(entity){
		// Ha az entitások közt van, vegyük ki
		for (var i=0; i<world.entities.length;i++){
			if (world.entities[i]==entity) {
				world.entities.splice(i,1);
				break;
			}
		}
		// Ugyanígy a rajzolhatókra
		for (var i=0; i<world.drawables.length;i++){
			if (world.drawables[i]==entity) {
				world.drawables.splice(i,1);
				break;
			}
		}
		// És az animálhatókra
		for (var i=0; i<world.animatables.length;i++){
			if (world.animatables[i]==entity) {
				world.animatables.splice(i,1);
				break;
			}
		}
	},
	entities: [],
	drawables: [],
	animatables: [],
	simulate: function(time) {
		for (var i = 0; i < world.animatables.length; i++) {
			var animatable = world.animatables[i];
			animatable.animate(time);
		}
	},
	handleInputs: function(mouse, keyboard) {
		// Alma
		player.speed.x = (keyboard[39] - keyboard[37])*100;
		player.speed.y = (keyboard[40] - keyboard[38])*100;

		var mousePos = new Vector(mouse.x, mouse.y);
		var cannonpos = player.position.clone();
		if (mouse.left) {
			var explosion = new Explosion({
				particles: [new Circle(cannonpos.x,cannonpos.y,{
						size: 10,
						color: colors[1],
						friction: 0.005,
						world: world,
						mass: 2,
						speed: mousePos.clone().subtract(cannonpos).normalize().scaleInPlace(700),
						life: 10000
					})],
				generator: function() {
					return new Square(cannonpos.x,cannonpos.y,{
						size: 3,
						color: colors[3],
						friction: 0.05 + Math.random() * 0.001,
						world: world,
						mass: Math.random(),
						life: Math.random()*200+800
					});
				},
				world:world,
				particlesCount: 10,
				strengthMin: 100,
				strengthMax: 400,
				coneWidth:Math.PI/8,
				coneOffset: Math.atan2(-mousePos.clone().subtract(cannonpos).y, mousePos.clone().subtract(cannonpos).x)
			});
			
			explosion.fire(cannonpos);
			mouse.left =0;
		}
	}
};

var player = {
	position: new Vector(cWidth/2, cHeight/2),
	speed: new Vector(),
	drawTo: function(ctx){
		ctx.fillStyle = "blueviolet";
		ctx.fillRect(player.position.x,player.position.y,3,3);
	},
	animate: function(time){
		player.position.addInPlace(player.speed.scale(time/1000));
	}
};

world.insert(player, true, true);

var colors = ["#a171ca", "#0a46c1", "#99ea49", "#abac0a"];

var lastT = 0;
var gameLoop = function(t) {
	if (lastT == 0) {
		var delta = 60 / 1000;
		lastT = t;
	}
	else {
		delta = t - lastT;
		lastT = t;
	}

	window.requestAnimationFrame(gameLoop);

	clearCtx();

	world.handleInputs(mouse, keyboard);

	world.simulate(delta);

	for (var i = 0; i < world.drawables.length; i++) {
		var drawable = world.drawables[i];
		drawable.drawTo(ctx);
	}
};

var mouse = {
	x: 0,
	y: 0,
	left: false,
	right: false
};

canvas.onmousedown = function(){
	mouse.left = 1;
};

canvas.onmouseup = function(){
	mouse.left = 0;
};

canvas.onmousemove = function(ev) {
	var rect = canvas.getBoundingClientRect();
	mouse.x = ev.offsetX || ev.clientX - rect.left;
	mouse.y = ev.offsetY || ev.clientY - rect.top;
};


var keyboard = {
	38:0, // fel
	40:0, // le
	37:0, // bal
	39:0  // jobb
};
document.onkeydown = function(ev){
	if (ev.keyCode in keyboard){
		keyboard[ev.keyCode]=1;
		return false;
	}
	return true;
};
document.onkeyup = function(ev){
	if (ev.keyCode in keyboard){
		keyboard[ev.keyCode]=0;
		return false;
	}
	return true;
};

window.requestAnimationFrame(gameLoop);