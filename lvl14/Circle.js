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
    this.speed.addInPlace(this.acceleration.scale(time / 1000 * this.mass));

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
        var boundingCircleRadius = other.size/2;
    }
    var distance = this.position.subtract(other.position).length();
    if (distance < (this.size/2 + boundingCircleRadius)) {
        return true;
    } else {
        return false;
    }
};

// Próbáljunk meg rugalmas ütköztetést szimulálni
Circle.prototype.handleCollisionWith = function (other) {
    if (other instanceof Circle) {
        var v1 = this.speed;
        var x1 = this.position;
        var m1 = this.mass;
        var v2 = other.speed;
        var x2 = other.position;
        var m2 = other.mass;
        var x12Diff = x1.subtract(x2);
        var x21Diff = x2.subtract(x1);
        
        var v1New = v1.subtract(x12Diff.scale(2 * m2 / (m1 + m2) * v1.subtract(v2).scalar(x12Diff) / Math.pow(x12Diff.length(), 2)));
        var v2New = v2.subtract(x21Diff.scale(2 * m1 / (m1 + m2) * v2.subtract(v1).scalar(x21Diff) / Math.pow(x21Diff.length(), 2)));
        
        this.speed = v1New;
        other.speed = v2New;
    }
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