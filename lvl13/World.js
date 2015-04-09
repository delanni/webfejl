/**
* Az eddigi world objektum helyett készítsünk egy osztályt, amit példányosítva visszakapjuk azt a world objektumot
*/


var World = function () {
    // A tulajdonságokat a this objektumra tehetjük
    this.gravity = new Vector(0, 200);
    this.entities = [];
    this.drawables = [];
    this.animatables = [];
    
    // A függvényeket is rátehetjük a this objektumra, így elérhetők lesznek a World példányokon
    this.insert = function (entity, asDrawable, asAnimatable) {
        // A kódban a world előfordulásokat this-re cserélhetjük, a this jelenti az éppen elkészülő objektumot
        entity.world = this;
        this.entities.push(entity);
        if (asDrawable) {
            this.drawables.push(entity);
        }
        if (asAnimatable) {
            this.animatables.push(entity);
        }
    };

    this.remove = function (entity) {
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i] == entity) {
                this.entities.splice(i, 1);
                break;
            }
        }
        for (var i = 0; i < this.drawables.length; i++) {
            if (this.drawables[i] == entity) {
                this.drawables.splice(i, 1);
                break;
            }
        }
        for (var i = 0; i < this.animatables.length; i++) {
            if (this.animatables[i] == entity) {
                this.animatables.splice(i, 1);
                break;
            }
        }
    };

    this.draw = function (ctx) {
        for (var i = 0; i < this.drawables.length; i++) {
            var drawable = this.drawables[i];
            drawable.drawTo(ctx);
        }
    };

    this.simulate = function (time) {
        for (var i = 0; i < this.animatables.length; i++) {
            var animatable = this.animatables[i];
            animatable.animate(time);
        }
    };

    this.checkCollisions = function () {

        for (var i = 0; i < this.entities.length; i++) {
            for (var j = i + 1; j < this.entities.length; j++) {
                var e1 = this.entities[i];
                var e2 = this.entities[j];

                if (e1.intersects && e2.intersects) {
                    if (e1.intersects(e2) && e1.handleCollisionWith) {
                        e1.handleCollisionWith(e2);
                    }
                }
            }
        }
    };
};