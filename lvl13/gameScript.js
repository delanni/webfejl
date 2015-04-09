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
    position: new Vector(cWidth/2, cHeight-12),
    color: "#71c"
});
world.insert(player, true, true);

var mouse = {
    x: 0,
    y: 0,
    left: false,
    right: false
};

canvas.onmousedown = function () {
    mouse.left = 1;
};

canvas.onmouseup = function () {
    mouse.left = 0;
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

window.requestAnimationFrame(gameLoop);