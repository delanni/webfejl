/**
	Vector osztály, 2d vektor műveletek implementációjával
*/

var Vector = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

Vector.prototype.add = function (other) {
    return new Vector(this.x + other.x, this.y + other.y);
};

Vector.prototype.subtract = function (other) {
    return new Vector(this.x - other.x, this.y - other.y);
};

Vector.prototype.addInPlace = function (other) {
    this.x += other.x;
    this.y += other.y;
    return this;
};

Vector.prototype.scale = function (scaler) {
    return new Vector(this.x * scaler, this.y * scaler);
};

Vector.prototype.scaleInPlace = function (scaler) {
    this.x *= scaler;
    this.y *= scaler;
    return this;
};

Vector.prototype.length = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.normalize = function () {
    this.scaleInPlace(1 / this.length());
    return this;
};

// Korlátozó függvény, amivel könnyen, gyorsan limitálhatjuk a sebességet pl.
Vector.prototype.clamp = function (min, max) {
    if (min > max) throw new Error("Inverse ranges");
    if (this.x > max) {
        this.x = max;
    } else if (this.x < min) {
        this.x = min;
    }
    if (this.y > max) {
        this.y = max;
    } else if (this.y < min) {
        this.y = min;
    }
};

Vector.prototype.clone = function () {
    return this.scale(1);
};

Vector.random = function (scaleX, scaleY) {
    if (arguments.length == 0) {
        scaleX = scaleY = 1;
    } else if (arguments.length == 1) {
        scaleY = scaleX;
    }

    return new Vector((Math.random() - 0.5) * scaleX, (Math.random() - 0.5) * scaleY);
};