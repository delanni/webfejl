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
	simulate : function(time){ /* Egyelőre üresen */}
};

// Készítsünk egy próbaobjektumot, amit ki lehet rajzolni
var square = {};
// Legyen rajta egy drawTo függvény, amit a főciklus meg tud hívni, ebben mondja meg magáról az objektum, hogy ŐT hogyan és hova kell kirajzolni
square.drawTo = function(context){
	context.fillStyle = "#eb01aa";
	context.fillRect(100,100,30,30);
};

// Adjuk őt hozzá a világhoz, hogy megjelenjen a renderelés során
world.drawables.push(square);


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