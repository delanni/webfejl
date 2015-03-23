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
		var mousePos = new Vector(mouse.x, mouse.y);
		var cannonpos = new Vector(0,cHeight);
		if (mouse.left) {
			var explosion = new Explosion({
				particles: [new Circle(cannonpos.x,cannonpos.y,{
						size: 10,
						color: colors[1],
						friction: 0.005 + Math.random() * 0.001,
						world: world,
						mass: 2,
						speed: mousePos.clone().subtract(cannonpos)
					})],
				generator: function() {
					return new Square(cannonpos.x,cannonpos.y,{
						size: 3,
						color: colors[3],
						friction: 0.05 + Math.random() * 0.001,
						world: world,
						mass: -1 + Math.random()
					});
				},
				world:world,
				particlesCount: 10,
				strengthMin: 100,
				strengthMax: 400,
				coneWidth:Math.PI/8,
				coneOffset: Math.atan2(-mousePos.clone().subtract(cannonpos).y, mousePos.clone().subtract(cannonpos).x)
			});
			
			explosion.fire();
			mouse.left =0;
		}
	}
};

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
var keyboard = {};

window.requestAnimationFrame(gameLoop);