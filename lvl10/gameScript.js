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
		// Számítsuk ki a tank aktuális sebességét a lenyomott gombokból
		player.speed.x = (keyboard[39]+keyboard[68] - keyboard[37] - keyboard[65])*100;
		player.speed.y = (keyboard[40]+keyboard[83] - keyboard[38] - keyboard[87])*100;


		var mousePos = new Vector(mouse.x, mouse.y);
		var cannonEnd = player.position.add(player.cannonVector);
		var playerToMouseVector = mousePos.subtract(player.position);
		if (mouse.left) {
			var explosion = new Explosion({
				particles: [new Circle(0,0,{
						size: 10,
						color: colors[1],
						friction: 0.005,
						world: world,
						mass: 2,
						speed: playerToMouseVector.clone().normalize().scaleInPlace(700),
						life: 10000
					})],
				generator: function() {
					return new Square(0,0,{
						size: 3,
						color: fireColors[Math.floor(Math.random()*3)],
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
				coneOffset: Math.atan2(-playerToMouseVector.y, playerToMouseVector.x)
			});
			
			explosion.fire(cannonEnd);
			mouse.left=0;
		}
	}
};

// Egy objektum a játékosnak
var player = {
	// tároljuk a játékos helyét
	position: new Vector(cWidth/2, cHeight/2),
	// aktuális sebességét
	speed: new Vector(),
	// ágyújának állását egy vektorban
	cannonVector: new Vector(),
	// kirajzolható
	drawTo: function(ctx){
		// rajzoláshoz használjuk ezt a színt
		ctx.fillStyle = "blueviolet";

		// rajzoljunk ki egy kört, ami a tank felső része
		ctx.beginPath();
		ctx.arc(player.position.x, player.position.y, 6, 0, Math.PI*2);
		ctx.fill();

		// rajzoljunk ki egy kissé lefelé eltolt téglalapot, ami a tank teste
		ctx.fillRect(player.position.x-12,player.position.y+6-4,24,8);

		// végül rajzoljunk egy kis pálcikát, ami az ágyú irányába mutat
		ctx.beginPath();
		// a középpontban kezdődik
		ctx.moveTo(player.position.x,player.position.y);
		// és a középponthoz képest az ágyú vektor koordinátáival van eltolva
		ctx.lineTo(player.position.x + player.cannonVector.x, player.position.y + player.cannonVector.y);
		ctx.stroke();
	},
	animate: function(time){
		var mousePos = new Vector(mouse.x, mouse.y);
		player.position.addInPlace(player.speed.scale(time/1000));
		player.cannonVector = mousePos.subtract(player.position).normalize().scaleInPlace(15);
	}
};

world.insert(player, true, true);

var fireColors = ['#FFFF47', '#FFBC42', '#FF5A1D'];
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
	39:0,  // jobb
	87:0, // W - fel
	83:0, // S - le
	65:0, // A - bal
	68:0, // D - jobb
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