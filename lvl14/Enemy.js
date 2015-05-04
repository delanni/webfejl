/**
 * Egy osztály az ellenségek számára
 * Mivel már van egy jól működő, ütközést kezelő kör osztályunk, próbáljuk meg azt kiterjeszteni, egy más kinézettel.
 **/

var Enemy = function (x, y, options) {
    // Ez, a későbbi prototípus beállítással együtt tekinthető leszármaztatásnak
    Circle.apply(this, arguments);

    // Saját kép-paraméterei, ami alapján kirajzolásra kerül a sprite, ezt vegyük ki egy egyszerű indexeléssel a prototípus tömbjéből
    this.planeCoords = this.planes[options.planeId || 0];
    this.planeId = options.planeId;
    this.currentPointValue = 1;
};

// És készítsünk el egy példányt a Circle-ből, aki a prototípusaként fog szolgálni az ellenség osztályunknak
// A protoípusos öröklésnek ez egy fajta meghurcolása, hogy úgy tudjuk használni, mint objektumorientált környezetben, de működik.
// A pontos körülményekért olvass utána a javascript prototípus alapú öröklési rendszerének.
Enemy.prototype = new Circle();

// Azzal, hogy az elkészült prototípuson felülírunk egy függvényt, gyakorlatilag felülírjuk a kirajzolást 
// minden leendő Enemy példányon, ami tulajdonképpen a célunk, hiszen az ellenségeket másképp szeretnénk kirajzolni
Enemy.prototype.drawTo = function (ctx) {
    ctx.drawImage(this.image,
        this.planeCoords.x, this.planeCoords.y, this.planeCoords.width, this.planeCoords.height,
        this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
}

Enemy.prototype.parentCollide = Enemy.prototype.handleCollisionWith;
Enemy.prototype.handleCollisionWith = function (other) {
    if (other instanceof Enemy || other instanceof Square) return;

    this.planeCoords = this.planes[this.planeId + 2];
    this.acceleration.scaleInPlace(0);

    var enemy = this;
    var expl = new Explosion({
        generator: function () {
            return new Square(0, 0, {
                size: 5,
                color: "rgb(2" + Math.floor(55 * Math.random()) + ",30,50)",
                friction: 0.05 + Math.random() * 0.001,
                world: enemy.world,
                mass: Math.random(),
                life: Math.random() * 200 + 800
            });
        },
        world: enemy.world,
        particlesCount: 20,
        strengthMin: 100,
        strengthMax: 400,
        coneWidth: Math.PI / 4,
        coneOffset: Math.atan2(-other.speed.y, other.speed.x)
    });
    expl.fire(this.position);

    this.parentCollide(other);
    this.world.yieldPoints(this.currentPointValue);
    this.mass = other.mass;
    this.currentPointValue *= 2;
    if (this.currentPointValue > 16) this.currentPointValue = 0;
};

// Mivel ez az osztály behúzásakor lefutó javascript kód, ezért lehetőségünk van bármit csinálni. Például behúzhatunk egy kép fájlt
// amiből később ki tudunk másolni sprite-okat a képernyőre. Mivel az ellenségek vannak ezen a képen, ezért itt behúzhatjuk.

// Készítsünk egy üres IMG taget
var atlas = document.createElement("img");
// az atlaszunk onload függvénye akkor hívódik meg, ha a kép sikeresen betöltődött
atlas.onload = function () {
    Enemy.prototype.image = atlas;
    Enemy.prototype.planes = [
        {
            x: 0,
            y: 292,
            width: 88,
            height: 73
        },
        {
            x: 0,
            y: 73,
            width: 88,
            height: 73
        },
        {
            x: 88,
            y: 219,
            width: 88,
            height: 73
        },
        {
            x: 88,
            y: 0,
            width: 88,
            height: 73
        },
    ];
}
atlas.style.display = "none";
// Amint hozzáadjuk az img elemet és beállítjuk annak forrását, elkezdi a böngésző letölteni a képet
// Források
// http://opengameart.org/content/tappy-plane
document.body.appendChild(atlas);
atlas.src = "planes.png";