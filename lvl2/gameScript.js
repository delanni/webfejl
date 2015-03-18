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

// Készítsük el a játék főciklusát, ami időzíti önmaga újbóli hívását, és egyelőre csak a képernyőt törli
var gameLoop = function(){
	window.requestAnimationFrame(gameLoop);
	clearCtx();
};

// Majd 1x hívjuk meg ezt a függvényt, hogy elinduljon a játék.
gameLoop();