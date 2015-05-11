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

		// Csak akkor ha nyomva van a gomb
		if (mouse.left) {
			for (var i = 0; i < world.entities.length; i++) {
				var entity = world.entities[i];
				if (entity instanceof Square) {
					entity.acceleration = mousePos.subtract(entity.position).scale(3);
				}
			}
		} else {
			for (var i = 0; i < world.entities.length; i++) {
				entity = world.entities[i];
				if (entity instanceof Square) {
					entity.acceleration.scaleInPlace(0);
				}
			}
		}
	}
};

var colors = ["#a171ca", "#0a46c1", "#99ea49", "#abac0a"];
var squares = [];
for (var i = 0; i < 5; i++) {
	var sq = squares[i] = new Square(Math.random() * cWidth, Math.random() * cHeight, {
		size: 15,
		color: colors[i % 4],
		friction: 0.005+Math.random()*0.001,
		world: world,
		mass: 1 + Math.random()
	});
	world.insert(sq, true, true);
}

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

canvas.onmousemove = canvas.onmousedown = canvas.onmouseup = function(ev) {
	var rect = canvas.getBoundingClientRect();
	mouse.x = ev.offsetX || ev.clientX - rect.left;
	mouse.y = ev.offsetY || ev.clientY - rect.top;
	mouse.left = (ev.buttons & 1) || (ev.which & 1);
};
var keyboard = {};

window.requestAnimationFrame(gameLoop);