// Fogjuk meg az alap DOM elemeket, amiket használni fogunk

// A vászon: nem sok haszna van, nem rá rajzolunk közvetlen, hanem a 2D kontextusára, de ő tartalmazza a meghatározó szélesség és hosszúság adatot
var canvas = document.getElementById("gameCanvas");
var cWidth = canvas.width;
var cHeight = canvas.height;

// A rajz kontextus. Ez az amit lehet módosítani, az ide történő rajzolás az ami megjelenik végül a weboldalon.
var ctx = canvas.getContext("2d");


// Csináljunk egy alap függvényt, ami törli a vásznat
var clearCtx = function(){
	ctx.save();
	// Legyen a játék háttérszíne egy halovány szürke
	ctx.fillStyle = "#eeeeee";
	ctx.fillRect(0,0,cWidth,cHeight);
	ctx.restore();
};

// Gyakori megközelítés, hogy az összes kirajzolandó objektumnak létrehozunk egy világ objektumot (World) amiben ezeket tároljuk
// Ebből az objektumból elérhetők lesznek kirajzolásra az egyedek, és ezen az objektumon később definiálhatunk szimulációs lépésre kódot
var world = {
	// Kirazolható elemek listája, a későbbi használatban kiderül, hogy ide olyan elemeket várunk, akiknek van egy .drawTo(ctx:CanvasRenderingContext2d) függvényük.
	// A javascript nem tiltja meg hogy egy nem-ilyen objektumot tegyünk a tömbbe, de ezzel a saját bokánkat ütjük meg.
	drawables: [],
	// Animálható elemek listája, ezek kerülnek a szimuláló ciklus során animálásra. Olyan objektumokat várunk, akiken van egy .animate(time:number) függvény, amit a szimuláció során meghívhatunk
	animatables: [],
	simulate : function(time){ 
		for(var i=0;i<world.animatables.length;i++){
			var animatable = world.animatables[i];
			animatable.animate(time);
		}
	}
};

// Az objektumunknak tárolnia kell, hogy pl. hol van, hogy azt körről körre tudjuk rajta animálni
var square = {
	position : [100,100],
	size : [30,30]
};
// A függvény most már a tárolt értékek alapján rajzolja ki a kis négyzetet
square.drawTo = function(context){
	context.fillStyle = "#eb01aa";
	context.fillRect(this.position[0],this.position[1],this.size[0],this.size[1]);
};

// Definiáljunk rajta egy animáló függvényt, ami pl. mozgatja véletlenszerűen
square.animate = function(time){
	// Véletlenszerű mozgás egy kicsit a +x +y irányba tolva, hiszen -0.4 és 0.6 közti számokat generálunk
	this.position[0] += Math.random()-0.4;
	this.position[1] += Math.random()-0.4;
};

// Adjuk őt hozzá a világhoz, hogy megjelenjen a renderelés során, ;s hogy animálva is legyen
world.drawables.push(square);
world.animatables.push(square);


/* Készítsük el a játék főciklusát, ami:
 -időzíti önmaga újbóli hívását,
 -törli a képernyőt
 -szimulál egy ciklust a világban
 -kirajzolja az összes kirajzolható elemet
*/
var gameLoop = function(t){
	
	// Időzítjük a függvény újbóli meghívását amint szabad lesz a processzor
	window.requestAnimationFrame(gameLoop);
	
	// Törlünk a vásznon
	clearCtx();
	
	// Szimulálunk az időparaméter függvényében
	world.simulate(t);

	// Kirajzoljuk az összes kirajzolható elemet
	for(var i=0;i<world.drawables.length;i++){
		var drawable = world.drawables[i];
		drawable.drawTo(ctx);
	}
};

// Majd 1x hívjuk meg ezt a függvényt, hogy elinduljon a játék.
gameLoop();