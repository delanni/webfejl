var canvas = document.getElementById("gameCanvas");
var cWidth = canvas.width;
var cHeight = canvas.height;

var ctx = canvas.getContext("2d");


var clearCtx = function () {
    ctx.save();
    ctx.fillStyle = "#eeeeee";
    ctx.fillRect(0, 0, cWidth, cHeight);
    ctx.restore();
};

var world = new World();
var player = new Player({
    position: new Vector(cWidth / 2, cHeight - 12),
    color: "#71c"
});
world.insert(player, true, true);

var mouse = {
    x: 0,
    y: 0,
    left: false,
    right: false,
    triggerStart: 0,
};

canvas.onmousedown = function () {
    mouse.left = 1;
    mouse.triggerStart = Date.now();
};

canvas.onmouseup = function () {
    mouse.left = 0;
    
    var triggerEnd = Date.now();
    mouse.triggerLength = triggerEnd - mouse.triggerStart;
};

canvas.onmousemove = function (ev) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = ev.offsetX || ev.clientX - rect.left;
    mouse.y = ev.offsetY || ev.clientY - rect.top;
};


var keyboard = {
    38: 0, // fel
    40: 0, // le
    37: 0, // bal
    39: 0, // jobb
    87: 0, // W - fel
    83: 0, // S - le
    65: 0, // A - bal
    68: 0, // D - jobb
};
document.onkeydown = function (ev) {
    if (ev.keyCode in keyboard) {
        keyboard[ev.keyCode] = 1;
        return false;
    }
    return true;
};

document.onkeyup = function (ev) {
    if (ev.keyCode in keyboard) {
        keyboard[ev.keyCode] = 0;
        return false;
    }
    return true;
};


var lastT = 0;
var gameLoop = function (t) {
    var delta;
    if (lastT === 0) {
        delta = 60 / 1000;
        lastT = t;
    } else {
        delta = t - lastT;
        lastT = t;
    }

    window.requestAnimationFrame(gameLoop);

    clearCtx();

    player.handleInputs(mouse, keyboard);

    world.checkCollisions();
    world.simulate(delta);
    world.draw(ctx);
};

window.setInterval(function () {
    if (Math.random() >= 0.7) {
        var x, xspeed, id;
        if (Math.random() > 0.5) {
            x = cWidth;
            xspeed = -50 - Math.random() * 50;
            id = 0;
        } else {
            x = 0;
            xspeed = 50 + Math.random() * 50;
            id = 1;
        }
        var y = cHeight - 150 - Math.random() * (cHeight-200);
        var enemy = new Enemy(x, y, {
            size: 50,
            life: 15000,
            speed: new Vector(xspeed,0),
            acceleration: world.gravity.scale(-1),
            friction:0,
            mass: 10,
            planeId: id
        });
        world.insert(enemy,true,true);
    }
}, 500);

window.requestAnimationFrame(gameLoop);