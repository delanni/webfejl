/**
	Circle osztály, a körök reprezentálására.
	Függõség: Vector
*/

var Circle = function (x, y, options) {
    options = options || {};

    this.position = new Vector(x, y);

    this.world = options.world;

    this.size = options.size || 5;
    this.color = options.color || "#eb01aa";
    this.speed = options.speed || new Vector();
    this.acceleration = options.acceleration || new Vector();

    this.life = options.life || Infinity;

    this.mass = options.mass;
    this.friction = options.friction || 0;
    this.maxSpeed = Circle.SPD_MAX;
    this.minSpeed = Circle.SPD_MIN;
};

Circle.prototype.drawTo = function (context) {
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.size / 2, 0, 2 * Math.PI);
    context.fill();
};

Circle.prototype.animate = function (time) {
    this.speed.addInPlace(this.acceleration.scale(time / 1000));

    this.speed.addInPlace(this.world.gravity.scale(time / 1000 * this.mass));

    this.speed.clamp(this.minSpeed, this.maxSpeed);
    this.speed.scaleInPlace(1 - this.friction);

    this.position.addInPlace(this.speed.scale(time / 1000));

    this.life -= time;
    if (this.life < 0) this.world.remove(this);
};

// Ugyanaz mint a játékosnál kb.
Circle.prototype.intersects = function (other) {
    if (other instanceof Square) {
        var boundingCircleRadius = other.size * Math.sqrt(2) / 2;
    } else if (other instanceof Circle) {
        var boundingCircleRadius = other.size;
    }
    var distance = this.position.subtract(other.position).length();
    if (distance < (this.size + boundingCircleRadius)) {
        return true;
    } else {
        return false;
    }
};

Circle.prototype.handleCollisionWith = function (other) {
    console.log(this, "collided", other);
};

Circle.prototype.clone = function () {
    var c = new Square();
    var k = Object.keys(this);
    for (var i = 0; i < k.length; i++) {
        if (this[k[i]].clone) {
            c[k[i]] = this[k[i]].clone();
        } else {
            c[k[i]] = this[k[i]];
        }
    }
};

Circle.SPD_MIN = -600;
Circle.SPD_MAX = 600;