/**
	Square osztály, a négyzetek reprezentálására.
	Függõség: Vector
*/

var Square = function (x, y, options) {
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
    this.maxSpeed = Square.SPD_MAX;
    this.minSpeed = Square.SPD_MIN;
};

Square.prototype.drawTo = function (context) {
    context.fillStyle = this.color;
    context.fillRect(this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
};

Square.prototype.animate = function (time) {
    this.speed.addInPlace(this.acceleration.scale(time / 1000));

    this.speed.addInPlace(this.world.gravity.scale(time / 1000 * this.mass));

    this.speed.clamp(this.minSpeed, this.maxSpeed);
    this.speed.scaleInPlace(1 - this.friction);

    this.position.addInPlace(this.speed.scale(time / 1000));

    this.life -= time;
    if (this.life < 0) this.world.remove(this);
};

// Ugyanaz mint a játékosnál kb.
Square.prototype.intersects = function (other) {
    if (other instanceof Square) {
        var boundingCircleRadius = other.size * Math.sqrt(2) / 2;
    } else if (other instanceof Circle) {
        var boundingCircleRadius = other.size;
    }
    var distance = this.position.subtract(other.position).length();
    if (distance < (this.size * Math.sqrt(2) / 2 + boundingCircleRadius)) {
        return true;
    } else {
        return false;
    }
};

Square.prototype.clone = function () {
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

Square.SPD_MIN = -600;
Square.SPD_MAX = 600;