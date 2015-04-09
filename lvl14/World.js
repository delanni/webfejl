/**
* Az eddigi world objektum helyett készítsünk egy osztályt, amit példányosítva visszakapjuk azt a world objektumot
*/


var World = function () {
    // A tulajdonságokat a this objektumra tehetjük
    this.gravity = new Vector(0, 200);
    this.entities = [];
    this.drawables = [];
    this.animatables = [];
    
    this.points = 0;
    
    this.yieldPoints = function(amount){
        this.points += amount;
    }
    
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
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.strokeText("Points:" + this.points, cWidth / 2, 20);
    };

    this.simulate = function (time) {
        for (var i = 0; i < this.animatables.length; i++) {
            var animatable = this.animatables[i];
            animatable.animate(time);
        }
    };

    this.checkCollisions = function () {
        // Ha esetleg megváltozna ütközés kezelés közben, akkor se fussunk végtelen ciklusba
        var entitiesLength = this.entities.length;
        for (var i = 0; i < entitiesLength; i++) {
            for (var j = i + 1; j < entitiesLength; j++) {
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