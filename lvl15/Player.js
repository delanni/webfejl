/**
 * Gyűjtsük egy osztályba a játékossal kapcsolatos dolgokat.
 *
 **/

// A játékos osztályunk is hasonló az összes többihez, egy-az-egyben az objektumpéldányt alakíthatjuk át osztállyá.
var Player = function (options) {
    // A tulajdonságokat ráaggatjuk a this objektumra, aki az elkészítendő példányt jelenti
    this.position = options.position || new Vector();
    this.speed = new Vector();
    this.cannonVector = new Vector();
    this.color = options.color || "blueviolet";

    // A függvényeket a this-re is rátehetjük, hiszen akkor is megjelenik a játékoson
    // habár, a prototype-os megoldással szemben itt annyi függvény példány lesz a memóriában, ahány példány a játékosból
    this.drawTo = function (ctx) {
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(this.position.x - 12, this.position.y + 6 - 4, 24, 8);

        ctx.beginPath();

        ctx.moveTo(this.position.x, this.position.y);

        ctx.lineTo(this.position.x + this.cannonVector.x, this.position.y + this.cannonVector.y);
        ctx.stroke();
    };

    this.animate = function (time) {
        this.position.addInPlace(this.speed.scale(time / 1000));
    };

    this.intersects = function (other) {
        // Kb egy 8 sugaru korrel lehet bennfoglalni a jatekost
        var playersBoundingCircleRadius = 8;

        // Megnezzuk a vizsgalt targy bennfoglalo sugarat
        if (other instanceof Square) {
            // Negyzeteknel az atlo fele
            var boundingCircleRadius = Math.sqrt(2) * other.size / 2;
        } else if (other instanceof Circle) {
            // Koroknel trivialis
            var boundingCircleRadius = other.size;
        }
        // A tavolsag az egyik kozeppontbol masik kozeppontba huzott vektor hossza
        var distance = other.position.subtract(this.position).length();
        // Ha ez a tavolsag kisebb mint a ket bennfoglalo kor sugaranak osszege, akkor metszik egymast
        if (distance < (playersBoundingCircleRadius + boundingCircleRadius)) {
            return true;
        } else {
            return false;
        }
    };

    this.handleCollisionWith = function (other) {
        if (other instanceof Circle) {
            if (other.speed.y > 0) {
                // Játékossal való ütközés, akár halál is lehetne :)
            }
        }
    };

    // Ha csinálunk egy egyszerű változót, az nem kerül rá a player példányokra, szóval a kívülről elérni nem kívánt tuljadonságokat így elrejthetjük.
    var fireColors = ['#FFFF47', '#FFBC42', '#FF5A1D'];

    this.handleInputs = function (mouse, keyboard) {
        var mousePos = new Vector(mouse.x, mouse.y);

        this.speed.x = (keyboard[39] + keyboard[68] - keyboard[37] - keyboard[65]) * 100;
        this.cannonVector = mousePos.subtract(this.position).normalize().scaleInPlace(15);

        var cannonEnd = this.position.add(this.cannonVector);
        var playerToMouseVector = mousePos.subtract(this.position);

        var _world = this.world;

        if (mouse.triggerLength) {
            var shotStrength = Math.min(1, Math.max(3, mouse.triggerLength));
            var explosion = new Explosion({
                particles: [new Circle(0, 0, {
                    size: 10 * Math.sqrt(shotStrength),
                    color: "hsl(" + Math.floor(Math.random() * 360) + ",90%,40%)",
                    friction: 0.005,
                    world: _world,
                    mass: 2 * shotStrength,
                    speed: playerToMouseVector.clone().normalize().scaleInPlace(700 * Math.sqrt(shotStrength)),
                    life: 10000
                })],
                generator: function () {
                    return new Square(0, 0, {
                        size: 3,
                        color: fireColors[Math.floor(Math.random() * 3)],
                        friction: 0.05 + Math.random() * 0.001,
                        world: _world,
                        mass: Math.random(),
                        life: Math.random() * 200 + 800
                    });
                },
                world: _world,
                particlesCount: 10 * shotStrength,
                strengthMin: 100,
                strengthMax: 400 * Math.sqrt(shotStrength),
                coneWidth: Math.PI / 8,
                coneOffset: Math.atan2(-playerToMouseVector.y, playerToMouseVector.x)
            });

            explosion.fire(cannonEnd);
            mouse.triggerLength = 0;
        }
    };
};