Játék készítése Javascript-ben, Canvas-szel
-------------------------------------------

A következőkben egy meglehetősen hosszú cikkben végigviszem egy egyszerű HTML5 játék fejlesztését az alapoktól a kész játékig. A fejlesztés során nem használok mást, mint a HTML5 Javascript és Canvas eszköztárát, és egy külső forrásból származó képet.

A javascript a böngészők által futtatott scriptnyelv/programozási nyelv. A legfőbb használati területe a weboldalak interaktívvá tétele felhasználói input kezeléssel, animációval, és programozott eseményekkel. A javascript futtatómotorok kifinomultságának köszönhetően olyan jó végrehajtási sebességgel rendelkeznek a böngészők, hogy játékokat is készíthetünk kizárólag kliens oldali kóddal. A játékok javascript kód formájában íródnak, és megjelenítéshez a HTMLCanvasElement példányait, a \<canvas\> elemeket használják.

Az elkészülő játék egy egyszerű ügyességi játék lesz, amiben egy tankkal kell repülőket lelőni. A játék esztétikai célból némi fizikát és részecskerendszert is tartalmaz, a játéklogikához szükséges mozgatás, megjelenítés és ütközésdetektálásokon kívül.
A játék elkészítését azzal vezetjük fel, hogy felépítünk egy világot, ami otthont képes adni jópár hasonló játéknak, hiszen kezelni fog néhány alapvető fizikai törvényt, és látványos hatást. Ez az általános fejlesztési rész a 9. fejezetig tart, utána átalakítjuk úgy, hogy a fent említett ügyességi játék legyen.

A fejlesztés 14 nagyobb lépésben történik. Ezek sorban a következők:

1. [A projekt alapjai](#1-a-projekt-alapjai)
2. [A canvas és a renderloop alapjai](#2-a-canvas-%C3%A9s-a-renderloop-alapjai)
3. [A játékvilág és rajzolás a canvas-en](#3-a-j%C3%A1t%C3%A9kvil%C3%A1g-%C3%A9s-rajzol%C3%A1s-a-canvas-en)
4. [Játékelemek animációja](#4-j%C3%A1t%C3%A9kelemek-anim%C3%A1ci%C3%B3ja)
5. [Vektor és négyzet osztályok, példányosítás](#5-vektor-%C3%A9s-n%C3%A9gyzet-oszt%C3%A1lyok-p%C3%A9ld%C3%A1nyos%C3%ADt%C3%A1s)
6. [Inputkezelés](#6-inputkezel%C3%A9s)
7. [Pszeudo-fizikai megközelítés](#7-pszeudo-fizikai-megk%C3%B6zel%C3%ADt%C3%A9s)
8. [Pszeudo-fizika, gravitáció](#8-pszeudo-fizika-gravit%C3%A1ci%C3%B3)
9. [Ágyú és robbanások](#9-%C3%81gy%C3%BA-%C3%A9s-robban%C3%A1sok)
10. [Játék alapok - A tank](#10-j%C3%A1t%C3%A9k-alapok---a-tank)
11. [Játék alapok - Ütközésdetektálás](#11-j%C3%A1t%C3%A9k-alapok---%C3%9Ctk%C3%B6z%C3%A9sdetekt%C3%A1l%C3%A1s)
12. [Játék alapok - Rugalmas ütközés](#12-j%C3%A1t%C3%A9k-alapok---rugalmas-%C3%BCtk%C3%B6z%C3%A9s)
13. [Rendszerezés, refaktorálás](#13-rendszerez%C3%A9s-refaktor%C3%A1l%C3%A1s)
14. [Játék logika - Ellenségek](#14-j%C3%A1t%C3%A9k-logika---ellens%C3%A9gek)

Az út hosszú, de tanulságos. A forráskódot folyamatosan javítjuk és szépítjük, hogy a végén egy jól áttekinthető kódunk legyen.

1. A projekt alapjai
--------------------
Miután nulladik lépésként vettünk egy nagy levegőt, és átgondoltuk, hogy is fogjuk felépíteni a játékot, első lépésként felejtsük el amin fáradalmasan gondolkoztunk, és essünk neki a fájlok gyártásának, és a dolog majd alakulni fog magától.

Készítsünk egy *index.html* fájlt, amiben a játékunkat fogjuk megjeleníteni, és készítsünk hozzá egy *gameScript.js* fájlt, amibe a játékot megvalósító javascript kód fog kerülni a későbbiekben.

Az *index.html*-ben ágyazzunk meg a szokásos általános HTML alapokkal, dokumentum típus deklaráció, html tag, head és body tagek, lokális stíluslap, és egy canvas elem, amin végül a rajzolás fog történni. A dokumentum végén pedig egy script tagben húzzuk be az egyelőre üres javascript fájlunkat. A végeredmény így néz ki:

```html
<!DOCTYPE html>
<html>
<head>
	<meta encoding='utf-8' />
	<!-- Stíluslap egy egyszerű felépítéséhez-->
	<style>
		body{
			margin:0;
			padding:0;
			background-color:#aaa;
		}
		#gameCanvas{
			border: 1px solid #666;
			margin-left:auto;
			margin-right:auto;
			margin-top: 5%;
			display:block;
		}
	</style>
</head>
<body>
	<!-- A fő elem, a Canvas, a vászon ahova rajzolgatunk -->
	<canvas id='gameCanvas' width='640' height='480'> </canvas>
	<!-- Húzzuk be a scriptet is, ami a játékot valósítja meg -->
	<script src='gameScript.js' type='text/javascript'></script>
</body>
</html>
```

A stílusokkal ki szerettem volna emelni, hogy középen már ott van egy vászon, amin még egyelőre nem történik semmi. Ha ezt megnyitjuk egy böngészőben, akkor láthatjuk, hogy a háttér színétől kicsit eltérő színben, kerettel ott egy HTMLCanvasElement, ami a további munkánk alapját fogja képezni.

2. A canvas és a renderloop alapjai
---------------

A második lépésben a HTML Canvas rajzolást készítjük elő, és egy alapvető ciklust készítünk a játékhoz, ami folyamatosan frissíteni fogja, és kirajzolja a játékunk világának állapotát. Lássunk is hozzá, ehhez az eddig üresen várakozó *gameScript.js* fájlt kell szerkesztenünk. Amit ide írunk, annak hatását a HTML-ben lévő hivatkozás miatt az *index.html*-ben látjuk.

Valamilyen szelektorokkal fogjuk meg az alap DOM elemeket, amiket használni fogunk, és csináljunk változókat a gyakran használatos tulajdonságaiknak, pl.: a vászon szélességének, és hosszának.

```javascript
var canvas = document.getElementById("gameCanvas");
var cWidth = canvas.width;
var cHeight = canvas.height;
var ctx = canvas.getContext("2d");
```

Valójában a _canvas_ nevű változót nem sokat fogjuk használni, hiszen az összes rajz művelet valójában a vászon *render kontextusán* (_ctx_) fog történni. Ezért ezt is külön változóba helyeztük.

Készítsünk egy alap függvényt, ami törli a vásznat. Ez a függvény paraméterül kapja a törlendő kontextust, és azt teljes egészében halvány szürkére színezi. 

```javascript
var clearCtx = function(){
    // Miután szürkére állítottuk az ecsetünk színét, rajzoljunk egy pont akkora téglalapot, ami lefedi a teljes vásznat.
	ctx.fillStyle = "#eeeeee";
    // Ehhez a kontextus fillRect függvényét használjuk, ami (x,y,szélesség, hosszúság) formájában téglalapot rajzol.
	ctx.fillRect(0,0,cWidth,cHeight);
};
```

Miután ez a függvényünk megvan, már csak valamilyen módon kell egy örökké futó ciklust készítenünk, ami ezt a függvényt hívogatja. A böngészőkben van egy pár lehetőségünk időzítve hívogatni függvényeket, például a _setTimeout_ vagy _setInterval_ függvények. A modern böngészőkön azonban adott egy _requestAnimationFrame_ függvény, amely másodpercenként 60-nál többször nem hívja meg a függvényt. Ezt a függvényt ajánlják az animációk és játékok időzítésének üzemeltetéséhez, így mi is ezt használjuk a következőkben.

Az időzítendő függvényünk lesz a játék főciklusa (*render loop* vagy *game loop*), aminek egyelőre a dolga a kép letörlése és önmaga időzítése.

```javascript
var gameLoop = function(){
	window.requestAnimationFrame(gameLoop);
	clearCtx();
};

gameLoop(); // Kell egy legelső hívás, hogy elinduljon a ciklus
```

A böngészőben most egy világos szürke vásznat kell látnunk. Bár ez még nem látványos, tudnunk kell, hogy ez a ciklus lesz minden alapja.

3. A játékvilág és rajzolás a canvas-en
---------------

Kezdjünk el objektumokat gyártani! Gyakori megközelítés a játékoknál, hogy készítünk egy *World objektumot*, amely tartalmazza (referenciája van rá) a játékban lévő összes entitást, egyedet, akit ki kell rajzolni, vagy animálni kell, vagy mindenesetre jó ha tudunk róla, hogy a világunkhoz tartozik. A world objektum a böngészőisten noteszfüzete, ahol nyilvántartja a világ állapotát. 


Készítsünk tehát egy világ objektumot, ez az objektum tartalmazzon egy tömböt, aki nyilvántartja az összes kirajzolható entitást. Ezeken fogunk végigiterálni a render ciklusban, és rajzoljuk ki egyesével őket.

Majd pedig készítsünk egy négyzet objektumot, amely kirajzolható, ezért tegyünk rá egy _drawTo_ függvényt, amely paraméterül kap egy kontextust, és kirajzolja rá a négyzetet, valahogyan, akárhogyan. Az objektum literálokról [itt](http://www.dyn-web.com/tutorials/object-literal/) találhattok rövid leírást. Lényegében annyit kell tudni róla, hogy értékek halmazát tárolhatjuk egy objektumban, és minden értéket a saját kulcsa különböztet meg. Készítéskor a literál szintaxissal a {} jelek közt kulcs:érték felsorolást teszünk, és ezek lesznek elérhetők egy objektumon.

```javascript
// Világ objektum, egy tulajdonsága van, drawables, ami egy üres lista, tömb
var world = {
	drawables: []
};

// Négyzet objektum, egy függvénye van, a drawTo
// abban mondja meg magáról az objektum, hogy ŐT hogyan és hova kell kirajzolni
var square = {
    drawTo : function(context){
        // Hexa formátumban megadott színinfó
        context.fillStyle = "#eb01aa";
        // x, y, szélesség, hosszúság
        context.fillRect(100,100,30,30);
    }
};

// Adjuk őt hozzá a világhoz, hogy megjelenjen a renderelés során
world.drawables.push(square);
```

Tehát elkészült egy világ. Elkészült egy négyzet, akinek van egy függvénye, amit hívva kirajzoljuk. Majd a négyzetet a világ rajzolható objektumokat tartalmazó tömbjébe helyeztük.

Nincs más dolgunk, mint a render ciklusban egy jól formált for ciklussal végigmenni az összes elemén, és kirajzolni őket. Ehhez írjuk át a _gameLoop_ függvényünket a következőképp:

```javascript
var gameLoop = function(){
	window.requestAnimationFrame(gameLoop);
	clearCtx();

	// Kirajzoljuk az összes kirajzolható elemet
	for(var i=0;i<world.drawables.length;i++){
		var drawable = world.drawables[i];
		drawable.drawTo(ctx);
	}
};
```

Mint látható, a render ciklusban a világ állapotaként tárolt objektumokon (ami egyelőre 1 db négyzet) lovaglunk végig, és rajzoljuk ki őket. Ezek eredményeképp látunk egy négyzetet a (100,100) koordinátapártól kezdődően (30,30) méretben.

4. Játékelemek animációja
---------------

A statikus világból a mozgó világba úgy jutunk el, ha az előző, rajzolási módszer analógiájára elkészítjük az animálhatók tömbjét, és a render ciklusban ezen is végigsétálunk. Tároljuk tehát az összes mozgatható, animálható element egy tömbben a világ objektumunkon. Ezt ugye gond nélkül megtehetjük, és egy elemet (például az előző négyzetünket) belehelyezhetünk egyszerre a rajzolhatók és az animálhatók tömbjébe is, mert a javascript objektumokról tetszőleges referenciát készíthetünk. (Hiszen amikor tömbökbe teszünk egy objektumot, akkor az igazi objektum a memóriában csak egy példányban él, de több helyről hivatkoznak ugyanarra az egy objektumra).

Tehát egy újabb tömb (1) a világon, egy újabb függvény (2) a négyzeten, és egy újabb ciklus (3) a játék főciklusában. Ez utóbbi a (2) függvényt hívogatja miközben az (1) elemein megy végig sorban. Továbbá a négyzet (4) objektumunkat úgy turbózzuk fel, hogy ő tárolja magáról, hogy hol és hogyan létezik, a _drawTo_ ez alapján rajzolja majd ki, és az _animate_ ezen tulajdonságait változtathatja.

```javascript
var world = {
	drawables: [],
	// Olyan objektumokat várunk, akiken van egy .animate(time:number) függvény, amit a szimuláció során meghívhatunk
	animatables: [] // (1)
};

// Az objektumunknak tárolnia kell, hogy pl. hol van, hogy azt körről körre tudjuk rajta animálni  
// (4)
var square = {
	position : [100,100],
	size : [30,30]
};

// A függvényeket a következő módon is elhelyezhetjük az objektumon, miután az már elkészült:
square.drawTo = function(context){
	context.fillStyle = "#eb01aa";
    // A kirajzolás az aktuális állapotot tükrözi, a négyzet helye és mérete szerint
    context.fillRect(this.position[0], this.position[1], this.size[0], this.size[1]);
};

// Definiáljuk az animáló függvényt, ami most véletlenszerű mozgatás
// (2)
square.animate = function(time){
	// Véletlenszerű mozgás egy kicsit a +x +y irányba tolva
	this.position[0] += Math.random()-0.4; 
	this.position[1] += Math.random()-0.4;
};

// ...
// Tegyük a négyzetet az animálhatók tömbjébe is, hogy a ciklus őt se hagyja ki.
world.animatables.push(square);
```

Nézzük, hogyan változik a főciklusunk, ha már animálnia is kell a világban élő egyedeket.

```javascript
var gameLoop = function(){
	window.requestAnimationFrame(gameLoop);
	clearCtx();
	
    // (3)
	for(var i=0;i<world.animatables.length;i++){
        var animatable = world.animatables[i];
        animatable.animate(); // bár most még nem adunk át időt, mert nem fontos
    }

	for(var i=0;i<world.drawables.length;i++){
		var drawable = world.drawables[i];
		drawable.drawTo(ctx);
	}
};

```

Ha ezek után elindítjuk az _index.html_-ünket, láthatjuk, hogy az animáció sikeres, hiszen képkockánként megmozdul valamilyen irányba egy kicsit a négyzet. Tehát megtörténik az animáció, a törlés és az újrarajzolás.

_Megjegyzés:_ Azt, hogy az animálhatók tömbjébe (_animatables_) csak olyanok kerüljenek, akiken van _animate_ függvény, a mi felelősségünk betartani. A javascript nem statikusan típusos nyelv, tehát megengedi nekünk, hogy olyan objektumokkal tegyük tele, amelyeken nincs semmiféle függvény, és így persze a kódunk hibát is okozhatna. Ezért figyeljünk, hogy ne helyezzünk olyan objektumokat ebbe a tömbbe, amelyeken nincs _animate_ függvény. (hasonlóképp a _drawables_ tömbben is csak olyasvalakik legyenek, akiknek van _drawTo_ függvényük).

A következő lépésben több példánnyal fogunk dolgozni, és ezekhez osztályokat is gyártunk.


5. Vektor és négyzet osztályok, példányosítás
---------------

Ha az előzőekben megjelenített, és animált négyzeteinkből többet szeretnénk létrehozni, akkor csinálhatjuk azt, hogy a felépített objektumot egyszerűen egy ciklusban gyártjuk, és így sok hasonló objektumot tudunk elkészíteni, de egy kézenfekvőbb, és elfogadottabb megközelítés, ha készítünk egy "osztályt" erre. Az objektumorientált programozási nyelvekből ismert osztályoknak a javascriptben igazából nincs megfelelője, hiszen a javascript nem osztályokat, hanem objektumokat, és nem leszármaztatásos öröklést, hanem prototípusokat használ. Ezen fogalmak kifejtése kicsit hosszas munka lenne, de aki valóban szeretne foglalkozni a nyelvvel, érdemes utánanéznie. 

Mi a következőkben úgy fogjuk szimulálni az OO nyelvek osztályait, hogy használatuk hasonló legyen. Erre a szimulációra a javascript némi támogatást is ad, névlegesen: ha egy függvényt úgy használunk mint osztályt, akkor az a függvény lehet az osztályunk konstruktora. A konstruktor pedig, mint tudjuk arra való, hogy példányokat gyártsunk egy osztályhoz. Az osztály szintű közös viselkedést pedig a konstruktorfüggvény prototípusán implementált függvényekkel fogjuk tudni megoldani, ugyanis, ha egy függvény prototípusán megjelenik egy érték (legyen az szám, szöveg, vagy éppen függvény), akkor az az összes példányon elérhető. Ha még nem érted, akkor próbáld a kód alapján megérteni.

Például elkezdhetünk implementálni egy Vektor osztályt a nulláról, ami például alap Vektor műveleteket fog tudni megoldani. Mire jó ez? A játékok általában 2D vagy 3D vektorokkal operálnak, hogy a pozíciókat, sebességeket, és egyéb vektormennyiségeket karban tudjanak tartani. Ráadásul könnyű is! Az összes művelet pontosan úgy működik, ahogy azt középiskolában megtanultuk.

A következő kódrészletet egy új _Vector.js_ fájlba helyeztem, amit az _index.html_-ben behivatkoztam, mint a _gameScript.js_-t.

```javascript
// Konstruktor függvény definiálásával kezdjük
var Vector = function(x,y){
	this.x = x || 0;
	this.y = y || 0;
};

// Vektorműveletek definiálása a prototípuson

// Pl. a vektor eltolása
Vector.prototype.addInPlace = function(other){
	this.x += other.x;
	this.y += other.y;
	return this;
};

// Pl a hossz kiszámítása Pitagorasz-tétellel
Vector.prototype.length = function(){
    return Math.sqrt(this.x*this.x + this.y*this.y);
};

// pl véletlenszerű vektor generálása
Vector.random = function(scaleX, scaleY){
	if (arguments.length == 0){
		scaleX = scaleY = 1;
	} else if (arguments.length == 1){
		scaleY = scaleX;
	}

	return new Vector((Math.random()-0.5)*scaleX,(Math.random()-0.5)*scaleY);
};
```

Ezt a vektor osztályt később még kiterjesztjük, de ennyi egyelőre elég ahhoz, hogy megoldjuk a játékunk jelenlegi szükségleteit.

Kényelmi okokból egészítsük ki a világ objektumunkat egy aprósággal. Azzal, hogy egy függvénnyel egyszerre az összes tároló tömbhöz hozzá tudjuk adni a rajzolandó és animálandó példányokat, készítsünk egy egyszerű insert függvényt.

```javascript
var world = {
	// Csináljunk egy függvényt ami egyszerre több helyre is beszúrja az elemet
	insert : function(entity, asDrawable, asAnimatable){
		world.entities.push(entity);
		if (asDrawable) world.drawables.push(entity);
		if (asAnimatable) world.animatables.push(entity);
	},
	entities: [],
	drawables: [],
	animatables: []
};
```

Végül készítsük el az eddigi 1 darab négyzetünk mintájára az osztályt, ami sok hasonló négyzetet tud majd paraméterezetten generálni. Ehhez is a függvény-osztály szintaxist használjuk mint az előbbiekben. Ezt a kódrészletet ott készítettem el, ahol eddig az 1 db négyzetet gyártottuk le:

```javascript

// Javascriptben a függvény akár konstruktor függvényként is szolgálhat objektumok gyártására
var Square = function(x,y,size, color){
	this.position = new Vector(x,y);
	this.size = size;
	this.color = color ||  "#eb01aa";
};

// Ugyanazokat a függvényeket, amiket eddig 1 darab négyzet objektumra tettünk rá, most a prototípust képző objektumra tehetjük. 
// Ennek hatására az összes példányon megjelenik
Square.prototype.drawTo = function(context){
	context.fillStyle = this.color;
	context.fillRect(this.position.x,this.position.y,this.size, this.size);
};
Square.prototype.animate = function(time){
	this.position.addInPlace(Vector.random());
};

```

Miután készen áll az új Square (négyzet) osztályunk, példányosíthatunk belőle kettőt, vagy sokat is, amelyek hasonlóan fognak viselkedni, mint az előző 1 darab.

```javascript
// Most már példányosíthatjuk bármilyen paraméterekkel több példányként is a négyzetünk
var square = new Square(100,100,30);
var square2 = new Square(150,150, 20, "#40ef30");

// használjuk a world új függvényét:
world.insert(square,true,true);
world.insert(square2,true,true);

// Akár sok objektumot is beszúrhatunk véletlenszerűen:
for(var i=0; i<50; i++){
	var sq = new Square(Math.random()*cWidth,Math.random()*cHeight, 
			15, "#9999" + Math.floor(Math.random()*10) + Math.floor(Math.random()*10));
	world.insert(sq,true, true);
}
```
Ez utóbbi szintaxis már kezd eléggé hasonlítani a C#-ban megszokottakhoz. A nagybetűs függvényeket (Vector, Square) úgy használhatjuk, mintha osztályokat jelképeznének, és a _new_ kulcsszóval példányosíthatjuk őket.

Ha ezután elindítjuk a játékot, látjuk, hogy sok négyzet példány megjelent a képen, és izegnek-mozognak. Ezzel megtanultuk az osztályok és a példányosítás alapjait. Ezt akkor érdemes használni, tehát, ha sok hasoló viselkedésű objektumot szeretnénk csinálni a játékban (pl.: pénzérmék, ellenségek, lövedékek). A következő lépés? Valahogy próbáljunk interaktivitást vinni a demónkba.

6. Inputkezelés
---------------

Ebben a fejezetben minimális inputkezelést fogunk megvalósítani olyan formában, hogy a kis négyzetek az egér pozíciója felé mozognak.
Első lépésként mozgassuk át a négyzetünket definiáló kódrészleteket egy külön fájlba, hogy ne piszkítsuk vele a _gameScript.js_ fájljainkat.

Egyúttal ki is egészíthetjük a négyzetünket két új tulajdonsággal, azzal hogy mi a sebessége, és azzal, hogy mi a gyorsulása. Középiskolás fizikával pedig ki tudjuk számolni ezek közt az összefüggést: a sebesség minden körben nő az idő és a gyorsulás szorzatával, a pozíció pedig minden körben változik a sebesség és az idő szorzatával. (Δv = t*a, és Δx = t*v)
Tehát készítsünk, és hivatkozzunk be egy Square.js fájlt a következő tartalommal:

```javascript
var Square = function(x,y,size, color){
	this.position = new Vector(x,y);
	this.size = size;
	this.color = color ||  "#eb01aa";

	this.speed = new Vector();
	this.acceleration = new Vector();
};

Square.prototype.drawTo = function(context){
	context.fillStyle = this.color;
	context.fillRect(this.position.x,this.position.y,this.size, this.size);
};

Square.prototype.animate = function(time){
    // Paraméterül kapja, hogy mennyi a Δt
    // (Δv = Δt*a, és Δx = Δt*v)
	this.speed.addInPlace(this.acceleration.scale(time/1000));
	this.position.addInPlace(this.speed.scale(time/1000));
};
```

Ezt letudtuk. A megtisztított _gameScript.js_-ünket 4 helyen egészítjük ki kóddal:
  1. Csak a generált négyzeteket hagyjuk benne
  2. A szimulációhoz minden körben kiszámítjuk az eltelt időt, és ezt átadjuk az animate függvényeknek, hogy a testek időarányosan mozogjanak
  3. Elkészítünk egy az egér és billentyűzet modellezésére alkalmas objektumot, amit eseménykezelőből frissítünk.
  4. A világ objektumunkon elkészítünk egy függvényt, ami valahogy kezeli az előző pont beli egér-modell állapotát.
  
(1). Most nincs szükség a külön generált példányokra, megtarthatjuk csak azt az 50 véletlenszerűt, akit a Square osztályból generálunk.
```javascript
var colors = ["#a171ca", "#0a46c1", "#99ea49", "#abac0a"];
var squares = [];
for(var i=0; i<50; i++){
    // Új négyzet készítése
	var sq = new Square(Math.random()*cWidth,Math.random()*cHeight, 15, colors[i%4]);
    // Amit beszúrunk a világunkba
	world.insert(sq,true, true);
    // És lementjük egy külön tömbbe, majd ezt fogja elérni az input kezelő függvény.
    squares[i] = sq;
}
```

(2). Ahhoz, hogy az eltelt idővel tudjuk arányosítani a mozgásokat, ki kell számolnunk, hogy mennyi idő telt el a legutóbbi képkocka óta. Ha stabilan, és fixen mindig 60FPS-sel menne a játék (60 képkocka másodpercenként) akkor 1000/60=16.6ms jutna minden egyes képkockára, és nem kellene számítgatnunk. De ez a szám változik a gép aktuális terheltségének függvényében, ezért ki kell számítanunk minden render-ciklusban. Ezt a következőképp tehetjük meg:
```javascript
// Ebben tároljuk, hogy mennyi volt a legutóbbi értéke a t-nek
var lastT = 0;

var gameLoop = function(t){
    // A gameLoop függvényünk paraméterét a requestAnimationFrame fogja adni. Ez a t mindig azt az időt mutatja, hogy mennyi ideje megy már a játék. Amit tennünk kell, hogy tároljuk a legutóbbi t értékeket, és kivonjuk az aktuálisból. Így megkapjuk a deltát.
	if (lastT == 0){
        // Ha eddig még nem volt soha, akkor hazudjuk, hogy a legelső képkocka 16ms volt.
		var delta=60/1000;
		lastT = t;
	} else {
        // Különben számítsuk ki a két t különbözetét
		delta = t - lastT;
        // És tároljuk le a legutóbbi t-t
		lastT = t;
	}
    
    window.requestAnimationFrame(gameLoop);
	
	clearCtx();

	/** itt hívjuk meg a majd 4. részben elkészülő függvényt **/
	world.handleInputs(mouse,keyboard);    
    
	for(var i=0;i<world.animatables.length;i++){
        var animatable = world.animatables[i];
        // Itt használjuk fel a kiszámított deltát
        animatable.animate(delta);
    }

	for(var i=0;i<world.drawables.length;i++){
		var drawable = world.drawables[i];
		drawable.drawTo(ctx);
	}
    
}
```

(3). Egy virtuális egér objektumban tároljuk és frissítjük, hogy hol volt legutóbb az egér pozíciója, és hogy nyomták-e a gombot. Ez sokkal egyszerűbb mint aminek hangzik. Egy egyszerű javascript objektum kell hozzá, és egy eseménykezelő, ami frissítgeti az egér értékét.
```javascript

/** Feliratkozunk mindenféle egér eseményekre, aminek állapotát tároljuk egy állapotváltozóban **/
var mouse = {
	x:0,
	y:0,
	left:false,
	right:false
};
// A vászonra tehetünk egy eseménykezelőt, ami minden mozgatá eseménynél frissíti a tárolt egérpozíciót.
canvas.onmousemove = function(ev){
    // Azért hogy Chrome-on és Firefoxon is megbízhatóan működjön, így kell megoldani:
    var rect = canvas.getBoundingClientRect();
	mouse.x = ev.offsetX || ev.clientX - rect.left;
	mouse.y = ev.offsetY || ev.clientY - rect.top;
};

/** Megelőlegezhetjük ezt a billentyűzetre is **/
var keyboard = {};

```

(4). Végül kell egy függvény, akit már a 2. lépésben meghívtunk. Ő az aki minden ciklusban ránéz az egér állapotára, és az alapján eldönti, hogy mit kell változtatni a világon. A mi esetünkben nem történik semmi bonyolult, csak az egér pozíciója felé fogjuk mozgatni a négyzeteket.

```javascript
    // Ez a függvény kerül a világ objetumunkra

    var world = {
    //...
    handleInputs : function(mouse,keyboard){
        // Először vegyük az egérpozíció helyvektorát
		var mousePos = new Vector(mouse.x,mouse.y);

		// Iteráljunk végig az összes elemen
		for(var i=0; i< world.entities.length; i++){
			// Vegyük ki az aktuális elemet
			var entity = world.entities[i];
			// S ha ez az elem bizony egy négyzet
			if (entity instanceof Square){
				// Akkor annak sebessége legyen a pozíciójából az egér helyvektorához húzott vektor
				// Ezt vektoralgebrában egyszerű kivonással megoldhatjuk
				entity.speed = mousePos.subtract(entity.position);
			}
		}
	   }
    };
```

Előbbiekhez még két kiegészítést tehetünk a Vector osztályunkban, hogy létezzen _.subtract_ függvényünk, és _.scale_ függvényünk. Ezek, nem úgy mint az _.addToSelf_, nem módosítják a vektort akin hívjuk, hanem új vektorokat gyártanak le. Első a különbségvektort állítja elő, a második pedig a megnyújtott másolatát. Így néznek ki:

```javascript

// A Vector.js fájlban, csatoljuk az új függvényeket a prototípusra, így minden Vector példányon meg fog jelenni.
Vector.prototype.subtract = function(other){
	return new Vector(this.x - other.x, this.y - other.y);
};

Vector.prototype.scale = function(scaler){
	return new Vector(this.x * scaler, this.y * scaler);
};

``` 
Ha mindennel végeztünk, fújjuk ki magunkat, és gondoljuk át, mi is amit megvalósítottunk: egy virtuális egér objektumban tároljuk az egér legutóbbi ismert helyét, és a világ szimulációja során, minden egyes képkocka kirajzolása előtt az egér pozíciója felé gyorsítjuk a négyzeteinket.

Ha már értjük mit csináltunk, próbáljuk ki, hogy valóban az történik-e amit vártunk.


7. Pszeudo-fizikai megközelítés
---------------

Azért írtam pszeudo-fizikait, mert jól hangzik, na meg persze azért is, mert nem lesz valódi fizikai szimuláció a játékban. Kicsit távolról próbálunk pár dolgot közelíteni, amit ismerünk a középiskolai fizikából. Első lépésként a gyorsulás-sebesség-pozíció hármast próbáljuk jobban közelíteni, amit már az előző részben is megemlítettünk.

A dolog, amit csinálunk most, az, hogy lecseréljük az egyszerű sebesség alapú mozgatást a négyzeteinkben egy gyorsulás és súrlódás alapúra. Ezzel kicsit jobban kinéző animációkat tudunk készíteni, és így tudjuk figyelembe venni a gravitációt is később.

Ehhez a Square.js-ben a Square osztályunk _animate_ függvényét szabjuk át így:
```javascript
Square.prototype.animate = function(time){
	// A gyorsulásból számítjuk a sebességet
	this.speed.addInPlace(this.acceleration.scale(time/1000));

	// Csökkentjük a sebességet a súrlódással, és limitáljuk azt két határ közé
	this.speed.clamp(this.minSpeed, this.maxSpeed);
 	this.speed.scaleInPlace(1-this.friction);

	this.position.addInPlace(this.speed.scale(time/1000));
};

````

Amint látható, az előbb meghivatkoztunk 4 tulajdonságot ami nem volt eddig jellemző a négyzetünkre: gyorsulás, súrlódás, minimum és maximum sebesség. Felvehetnénk ezt egyszerűen új paraméterekként a Square konstruktorban, de annak az lenne a vége, hogy végtelen paraméter felé közelítenénk. Ehelyett használjuk a Javascriptben elterjedt paraméterobjektumos inicializálást, amely lényege, hogy a másodlagos tulajdonságokat egy objektumba tömörítve adjuk át a konstruktornak, aki ebből veszi ki az egyes értékeket.

Ehhez a Square konstruktora a következőképp alakul át:
```javascript
// Az egyre gyarapodó paraméterlista helyett options argumentum objektum
var Square = function(x,y, options){
	// Ha nem volt options megadva, akkor legyen az egy üres objektum
	options = options || {};

	this.position = new Vector(x,y);

    // Használjuk a || (vagy) operátort az alapértelmezett értékekhez
	this.size = options.size || 5;
	this.color = options.color ||  "#eb01aa";
	this.speed  = options.speed || new Vector();
	this.acceleration = options.acceleration || new Vector();

	// A valószerűbb viselkedéshez csökkenteni, és korlátozni kell a részecskék sebességét
	this.friction = options.friction || 0.1;
	this.maxSpeed = options.minSpeed || Square.SPD_MAX;
	this.minSpeed = options.maxSpeed || Square.SPD_MIN;
};

// Csinálhatunk osztály szinten is konstansokat, amiben az alapértelmezett értékeket tárolhatjuk.
Square.SPD_MIN = -150;
Square.SPD_MAX = 150;
``` 

Továbbá használtunk egy _.clamp_ függvényt, ami a vektor értékeit korlátozza minimum és maximum értékek közé. Ezt pótlólagosan felvisszük a Vector osztály függvényei közé, a Vector.js fájlban:
```javascript
// Korlátozó függvény, amivel könnyen, gyorsan limitálhatjuk a sebességet pl.
Vector.prototype.clamp = function(min, max) {
	if (min > max) throw new Error("Inverse ranges");
    // X
	if (this.x > max) {
		this.x = max;
	}
	else if (this.x < min) {
		this.x = min;
	}
    // Y
	if (this.y > max) {
		this.y = max;
	}
	else if (this.y < min) {
		this.y = min;
	}
};

```
Mivel a négyzetek már új féle tulajdonságokat is várnak konstruálás során, így adjuk meg a _gameScript.js_ megfelelő részében ezeket a paraméter objektum használatával:
```javascript
    // Ahol eddig generáltuk a négyzeteket, most így:
var colors = ["#a171ca", "#0a46c1", "#99ea49", "#abac0a"];
var squares = [];
for(var i=0; i<50; i++){
	var sq = squares[i] = new Square(Math.random()*cWidth,Math.random()*cHeight, {
		size:15,
		color:colors[i%4],
		friction: Math.random()*0.01
	});
	world.insert(sq,true, true);
}

```

Miután a négyzeteink felkészültek arra, hogy gyorsulással vezéreljük őket, már csak a fő input kezelő logikát kell úgy módosítani, hogy ne a négyzetek sebességét, hanem gyorsulásukat állítsa az egér kurzor felé mutató irányba:
```javascript
// gameScript.js handleInputs függvényében a megfelelő helyen:

    if (entity instanceof Square){
        // Ehelyett:
        //entity.speed = mousePos.subtract(entity.position);
        entity.acceleration = mousePos.subtract(entity.position);
    }
```
Ha semmit nem felejtettünk el, akkor az előzőhöz hasonlóképp működik a kis demónk, a négyzetek itt is az egeret követik, de mozgásuk láthatóan rugalmasabb, dinamikusabb.

8. Pszeudo-fizika, gravitáció
---------------

Az új és szép dinamikus világunkban van még egy triviális dolog ami segíthet a játékunk összhatásán: gravitáció!
Majdnem minden játékban előfordul, és néhány játék szinte csak erre alapoz. Az emberek életük során már elég jól előre tudják becsülni a dolgok röppályáját, ami annak köszönhető, hogy már megszoktuk és természetesnek tartjuk a gravitációt. Tehát ha a játékunk nem használ gravitációs jellegű erőt, akkor az természetellenes hatással fog járni.

Erre a változtatásokat a _gameScript.js_-ben és a _Square.js_-ben is kell tennünk:
1., Átírjuk az inputkezelést, hogy csak akkor vonzza a négyzeteket, ha mi akarjuk.
```javascript
// Alakítsuk át a handleInputs függvényünk a következőképp
// ...
handleInputs: function(mouse, keyboard) {
		var mousePos = new Vector(mouse.x, mouse.y);

		// Csak akkor ha nyomva van a gomb
		if (mouse.left) {
			for (var i = 0; i < world.entities.length; i++) {
				var entity = world.entities[i];
				if (entity instanceof Square) {
                // Legyen a gyorsulás az egér felé mutató vektor 3 szorosa
					entity.acceleration = mousePos.subtract(entity.position).scale(3);
				}
			}
		} else {
			for (var i = 0; i < world.entities.length; i++) {
				entity = world.entities[i];
				if (entity instanceof Square) {
                    // Különben nullázzuk a kívülről érkező gyorsulást
					entity.acceleration.scaleInPlace(0);
				}
			}
		}
	}
//...
```

2., Ahol eddig az egéreseményeinket gyűjtöttük, állítsuk be a virtuális egér pozícióján túl azt is, hogy nyomva van-e a gomb rajta. Ehhez egy böngészőfüggetlen trükkel a következőt írhatjuk oda ahol eddig csak a pozíciót mentegettük:
```javascript
canvas.onmousemove = canvas.onmousedown = canvas.onmouseup = function(ev) {
	var rect = canvas.getBoundingClientRect();
	mouse.x = ev.offsetX || ev.clientX - rect.left;
	mouse.y = ev.offsetY || ev.clientY - rect.top;
    // Próbáljuk kiolvasni hogy nyomva van-e valamelyik gomb
	mouse.left = ev.buttons || ev.which;
};
```
3., Felcsatolunk egy gravitáció vektor tulajdonságot, mint a világ tulajdonsága. Ez arra lesz jó, hogy ha az entitásoknak, pl egy négyzetnek megadjuk referenciaként az őt tartalmazó világot, akkor meg tudja nézni, hogy ott milyen gravitációs gyorsulásnak kell engedelmeskednie. 
```javascript
var world = {
	gravity: new Vector(0, 200),
    // ...
};

// Továbbá adjuk paraméterül a világot a négyzetünknek, hogy szükség esetén meg tudja nézni a világ gravitációját
// Ahol a négyzeteket generáltuk:
var colors = ["#a171ca", "#0a46c1", "#99ea49", "#abac0a"];
var squares = [];
for (var i = 0; i < 5; i++) {
	var sq = squares[i] = new Square(Math.random() * cWidth, Math.random() * cHeight, {
		size: 15,
		color: colors[i % 4],
		friction: 0.005+Math.random()*0.001,
		// Már a világot és egy tömeget is átadunk a négyzetnek
        world: world,
		mass: 1 + Math.random()
	});
	world.insert(sq, true, true);
}

```
4., Egészítsük ki a négyzet osztályunkat, hogy a megkapott tömegnek megfelelően gyorsítsa magát a világ gravitációjának irányában. (_* megjegyzés: innen látszik, hogy pszeudo-fizika, mert a valós világban a testek a tömegüktől függetlenül egységesen ~9.81m/(s^2)-tel gyorsulnak lefelé, de a játékban ezzel a kis csalással lehet szimulálni leginkább a légellenállást és a zuhanási végsebességet_). Szóval a _Square.js_-ben:

```javascript
    // A Square konstruktorában vegyük át a világot és a tömeget:
var Square = function(x,y, options){
	options = options || {};
    
    this.world = options.world;
	this.mass = options.mass || 0;
    
    // ...
    // a többi paraméter
    // ...
};

// Változtassuk meg az animáló függvényt, úgy hogy kezelje a gravitációt is:
Square.prototype.animate = function(time){
	this.speed.addInPlace(this.acceleration.scale(time/1000));
	
	// Számoljuk bele a gravitációs szabadesés hatását is, tömeggel súlyozva
	this.speed.addInPlace(this.world.gravity.scale(time/1000 * this.mass));

	this.speed.clamp(this.minSpeed, this.maxSpeed);
 	this.speed.scaleInPlace(1-this.friction);

	this.position.addInPlace(this.speed.scale(time/1000));
};

// Állítsuk a minimum és maximum küszöböket kicsit nagyobbra
Square.SPD_MIN = -600;
Square.SPD_MAX = 600;

```
5., Bónusz: Ha szeretnénk valahogy vizualizálni a vektorokat, amik az egér pozíció felé mutatnak, akkor a következő kódrészletet kell a négyzet kirajzolófüggvényeként írnunk:
```javascript
Square.prototype.drawTo = function(context){
	context.fillStyle = this.color;
	context.fillRect(this.position.x,this.position.y,this.size, this.size);
    // Ha van gyorsulás, akkor rajzoljunk
	if (this.acceleration.x || this.acceleration.y){
		context.strokeStyle = this.color;
        
        // Így jelezzük, hogy jegyezze fel a következő lépéseket
		context.beginPath();
        
        // Menjünk a vásznon a négyzet pozíciójába
		context.moveTo(this.position.x,this.position.y);
        
        // És húzzunk onnan vonalat egy olyan pozícióba, amit a gyorsulás vektor harmadával toltunk el (harmadolni kell, mert a gyorsulás vektor az egérbe mutató vektor 3 szorosa lett korábbról)
		context.lineTo(this.position.x+this.acceleration.x/3, this.position.y+this.acceleration.y/3);
        
        // Majd mondjuk, hogy ennyit akartunk most rajzolni, megrajzolhatjuk a feljegyzett lépéseket
		context.stroke();
	}
};

```

Ha mindezzel végeztünk, megint pihenjünk rá, és nézzük meg munkánk eredményét. Ezúttal már egy játékhoz hasonló kis demót kaptunk, ahol rugalmas (látható, vagy láthatatlan, a bónusz lépéstől függ) fonalon lengethetünk négyzeteket, amely fonalat, ha elengedünk, a négyzetek lezuhannak.

9. Ágyú és robbanások
---------------
Gondolom, ha eddig volt türelmed eljutni a tutorialban, akkor neked is megfordult a fejedben, hogy milyen játékot lehetne ezekből az eszközökből, ezekkel a mechanikai elemekkel összerakni. Most még egy utolsó effektet bevezetünk, amivel tovább bővítjük a keretrendszerünket, ami végül otthont fog adni egy játéknak, amiről bővebben a következő részben írok.

Most tehát még egy effektust vezetünk be, ami kicsit testes (sok kód kell hozzá), de annál látványosabb, és sokban feldobja a játékunkat. 

Ez az effektus egy robbanás szerű részecskerendszer lesz. Fel kell használjuk az eddigi négyzeteinket, amik engedelmeskednek a gravitációs törvényeknek, és valahogyan keretbe szervezzük őket, hogy vezényszóra lehessen őket generálni.

Az effektus velejében annyit csinál, hogy legyárt egy halom olyan négyzetet, amelyek minimálisan variáltak a paramétereiket tekintve, és ezeket egy kezdősebességgel elindítja egy irányba. Ennnek az lesz a hatása, hogy egy robbanás szerű látványt kapunk, törmelék vagy füst részecskékkel. Ezt még annyira általánosra csináljuk, hogy később több helyen lehessen használni megfelelő paraméterezéssel.

_Megjegyzés: a kódbázis már elég nagy kezd lenni, így jó, ha átnézed, és megérted, mielőtt folytatod a kódrészletek átmásolását._

Fontos, hogy emlékezzünk, hogy a Square, négyzet osztályunk milyen módon paraméterezhető és készíthető, mert a robbanás ezeket a négyzeteket, vagy általánosabb nézetben részecskéket fogja használni alap építőelemeiként (általánosabban, hiszen csinálunk pl. egy kör osztályt, ami csak kinézetében különbözik a négyzettől).

Továbbá fontos, hogy emlékezzünk, hogy a javascriptben a függvények is objektumok. Tehát paraméterül lehet adni egy darab függvényt egy másiknak, aki meg tudja hívni az előbbit, és tudja használni annak a hívásnak az eredményét. Ezt a nyelvi tulajdonságot is használni fogjuk a következőkben.

Áttekintésként, ezt nem kell sehova írni:
```javascript
// Így hozunk létre egy új négyzetet:
new Square(40,50,{      size: 3,
						color: colors[3],
						friction: 0.05 + Math.random() * 0.001,
						world: world,
						mass: Math.random()
					});
// ahol a paraméterek az x, y koordináták, és a paraméter objektum, ami nevesítve tartalmazza a tulajdonságokat

// Így hozunk létre és adunk paraméterül egy függvényt egy másiknak:
// Egy függvény, ami visszaadja a megadott paraméter kétszeresét
var fn1 = function(x){
 return 2*x;
};

// Egy függvény, ami 2 paramétert vár, az első egy függvény
var fn2 = function(a,b){
  // és meghívja az első függvényt a második paraméterrel
 var aResult = a(b);
  // majd visszaadja annak eredményét
 return aResult;
};

fn2(fn1, 7); // tehát ennek a hívásnak a visszatérési értéke 14
```

Essünk tehát neki a robbanás osztály megtervezésének. A tervezés természetesen nem villámcsapásra megy, mint ahogy én a kódot megmutatom, hanem inkrementálisan fejlődik az osztály aszerint, hogy a hívó fél milyen tulajdonságokat és viselkedést vár el tőle. Én itt már csak azt tálalom, hogy az én logikám szerint mi lett ennek a tervezésnek az eredménye. Ehhez hozzunk létre egy új _Explosion.js_-t és azt húzzuk is be a szokásos módon az _index.html_-be.

Egy az egyben bemásolom a fájl kívánt tartalmát, és a kommentekkel magyarázom a részeit:
```javascript
/**
 * Ez egy robbanás objektumot képviselő osztály.
 * Azt tudja, hogy beállítás után, egy függvényhívás hatására felrobban,
 * amivel négyzeteket ad a világhoz a robbanás irányának megfelelően, ezek pedig szabadon esnek, és repülnek a világban
 * **/

// Konstruktor, paraméter objektummal
var Explosion = function(options) {
    // ha nincs semmi megadva, legyen üres obj. a par.obj.
    options = options || {};
    // A paraméterobjektum részei a következők:
    
    // A világ, ahova be kell tömni a létrejövő törmelék részecskéket
    this.world = options.world;
    // A kilövendő részecskéket be lehet adni egy tömb formájában
    this.particles = options.particles || [];
    // És be lehet adni generátor függvénnyel, ami legyártja őket
    this.generator = options.generator;
    // Meg lehet, és illik adni, hogy mennyi részecskét szeretnénk
    this.particlesCount = options.particlesCount || this.particles.length || 0;
    
    // Ekkor, ha nincs annyi részecske a részecsketömbben (ami akár üres vagy hiányzó is lehetett) akkor a generátorfüggvénnyel gyártunk további darabokat
    if (this.particles.length < this.particlesCount) {
        // ha van generátorfüggvény
        if (this.generator) {
            // akkor hívogassuk addig, amíg nem lesz annyi a tömbben amennyit kértünk
            while (this.particles.length < this.particlesCount) {
                var newPart = this.generator();
                this.particles.push(newPart);
            }
        }
    }

    // A kilövellés nyílási szélessége radiánokban
    this.coneWidth = options.coneWidth || Math.PI * 2;
    // A kilövellés elforgatása radiánokban a vízszinteshez képest
    this.coneOffset = options.coneOffset || 0;

    // A kilövellés minimum ereje és maximum ereje közt véletlen generálással kapnak sebességet a részecskék
    this.strengthMin = options.strengthMin || 0;
    this.strengthMax = options.strengthMax || 2;
};

// E függvény szolgál arra, hogy az előkészített robbanás objektumot elsüsse, és a robbanás tényleg megtörténjen
Explosion.prototype.fire = function() {
    // Minden részecskén végigsétálunk
    for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        // Ha nincs sebessége
        if (p.speed.length() == 0) {
            // akkor generálunk neki egyet a nyílás paramétereinek megfelelően egy irányt
            p.speed = Explosion._conal2(this.coneWidth, this.coneOffset);
            // és abban az irányban a min és max sebesség közt állítunk be kezdősebességet véletlenszerűen
            p.speed.scaleInPlace(Explosion._randbetween(this.strengthMin, this.strengthMax));
        }
        // végül a világhoz adjuk, így lefut a kirajzoló és animáló függvénye is minden körben, tehát megjelenik, és mozog.
        this.world.insert(p, true, true);

    }
};

// Ez a függvény szolgál arra, hogy a kilövellés nyílási szélessége és elforgatása szerint generáljon egy véletlenszerű irányt. Ha ez a nyílási szélesség 2pí, akkor bármilyen irányban repoülhet a részecske, különben egy tölcsér alak lesz
Explosion._conal2 = function(width, offset) {
    // Ennek a módja az, hogy csinálunk egy egységvektort, amit előbb eltolunk az elforgatáshoz, majd továbbtoljuk egy véletlenszerű értékkel a 0 és a nyílás paraméter közt. Ekkor van egy irányvektorunk, aminek az x és y koordinátája kell. 
    
    // Határozzuk meg a minimális elfordulást
    var minRot = offset - width / 2;
    // Adjunk hozzá valamennyi véletlen elfordulást, ami max a nyílás szélessége
    var randomRot = minRot + Math.random() * width;

    // Az x és y koordináták ennek az elfordulás vektornak cos és sin leképzettjei.
    var x = Math.cos(randomRot);
    var y = Math.sin(randomRot);
    // Tekintve, hogy a HTMLCanvas lefelé növeli az Y koordinátát, ezt itt negáljuk
    return new Vector(x, -y);
};

// Egy függvény egyszerű intervallum beli véletlen generálásra
Explosion._randbetween = function(a, b) {
    return Math.random() * Math.abs(a - b) + Math.min(a, b);
};
```
Ez nagyjából lefedi az Explosion osztályt, ez az általános rész, most megnézzük hogy kell használni, és hogy hogy néz ki. Ismlétlem, természetesen én sem az olvasási sorrendnek megfelelően gépeltem be elsőre ezt az osztályt, hanem a használat helyén felmerülő igények szerint alakítottam ki, de nincs lehetőség sajnos a tutorial során az inkrementális tervezés folyamatát végigvezetni.

Következő lépésben használjuk ezt az osztályt, ha már ilyen szépen megírtuk. A _gameScript.js_-ben a sokat módosítgatott _handleInputs_ függvényt kell a következőre alakítanunk, ahhoz, hogy kattintás hatására egy ágyúgolyót lőjünk az egér irányába:

```javascript
// A handleInputs függvény legyen ez:
function(mouse, keyboard) {
    // csináljunk az egér pozícióból egy vektort (vektorműveletekhez)
    var mousePos = new Vector(mouse.x, mouse.y);
    // Helyezzük el valahova az ágyút, pl a bal alsó sarokba, de bárhova lehet
    var cannonpos = new Vector(0,cHeight);
    
    // Ha a gombot megnyomták, akkor:
    if (mouse.left) {
        // Csináljunk egy CIRCLE példányt az ágyúgolyónak
        // Ez legyen ott ahol az ágyú van
        var cannonBall = new Circle(cannonpos.x,cannonpos.y,{
                    size: 10,
                    color: colors[1],
                    friction: 0.005,
                    world: world,
                    mass: 2,
                    //  és sebessége legyen az egér felé mutató vektor
                    speed: mousePos.subtract(cannonpos).scaleInPlace(2)
                });
        // Csináljunk egy függvényt, amivel a törmelék részecskéket le lehet generálni
        var pixelGeneratorFn = function() {
            // A függvény adjon vissza egy új négyzet példányt, randomizált tömeggel, és súrlódással
                return new Square(cannonpos.x,cannonpos.y,{
                    size: 3,
                    color: colors[3],
                    friction: 0.05 + Math.random() * 0.001,
                    world: world,
                    mass: Math.random()
                });
            };
            
        // készítsük el előre a paraméterobjektumot amit odaadunk az Explosion konstuktorának
        var explosionParams = {
            // A részecskék tömbje tartalmazza egyelőre az ágyúgolyót
            particles: [cannonBall],
            // De adjunk meg generátorfüggvényt h elő tudjunk állítani törmeléket
            generator: pixelGeneratorFn,
            world:world,
            // 10 darabot
            particlesCount: 10,
            // 100 és 400 sebesség közt
            strengthMin: 100,
            strengthMax: 400,
            // egy PI/6 (30fok) szögű nyílással
            coneWidth:Math.PI/6,
            // úgy elforgatva, hogy az egér pozíció felé mutasson
            coneOffset: Math.atan2(-mousePos.subtract(cannonpos).y, mousePos.subtract(cannonpos).x)
        };
        
        // Készítsük el a robbanás példányt az előzőleg összeállított paraméterekkel
        var explosion = new Explosion(explosionParams);

        // majd süssük is el, hogy lássuk a hatását 
        explosion.fire();
        // nullázzuk le a kattintás jelző változót, hogy csak 1 robbanást süssünk el egy kattintással
        mouse.left=0;
    }
}
```
Miután ismét megújítottuk a _handleInputs_ képességeit, tisztázzuk le az egér állapot kezelését a következőképp:
```javascript
// Az összetett eseménykezelő helyett, amit a 8. fejezetben csináltunk legyen 3 egyszerűbb eseménykezelő a triviális állapotváltozásokra

canvas.onmousedown = function(){
	mouse.left = 1;
};

canvas.onmouseup = function(){
	mouse.left = 0;
};

canvas.onmousemove = function(ev) {
	var rect = canvas.getBoundingClientRect();
	mouse.x = ev.offsetX || ev.clientX - rect.left;
	mouse.y = ev.offsetY || ev.clientY - rect.top;
};
```
Huh, a sok kódmásolgatás és *értelmezés* végére már csak egy apróság maradt. Az ágyúgolyóhoz egy Circle osztályt példányosítottam, ami nem létezik, de könnyen orvosolható. A körök a megjelenésükön kívül minden másban teljesen azonosan viselkednek a négyzetekkel. Ezért megtehetjük pl. azt, hogy egy az egyben lemásoljuk, és átnevezgetjük a _Square.js_-t, és a benne lévő változókat egy _Circle.js_-nek megfelelően, illetve be is hivatkozzuk azt az _index.html_-ben.

Az egyetlen hely, ahol meg kell változtatni a Circle osztályt:
```javascript
// Az az, hogy máshogy kell kirajzolni, mint a négyzetet
Circle.prototype.drawTo = function(context){
	context.fillStyle = this.color;
    // Kezdjünk egy új útvonalat rajzolni
	context.beginPath();
    // Rajzoljunk egy körívet, ami 0 pozícióból 2*PI-ig megy, tehát teljes kör lesz
	context.arc(this.position.x,this.position.y, this.size/2, 0, 2*Math.PI);
    // Majd kihúzás helyett töltsük fel azt
	context.fill();
};
```

Ha nem rontottunk el semmit, és én sem felejtettem el semmit, akkor ez a demó már egy elég jól kinéző demó, ami ágyúgolyókat lő az egér irányába, és azt látványossá teszi füst-(és/vagy)-törmelék részecskékkel. A paraméterekkel próbálkozhatsz, hogy sajátos kinézetet kapj.

A következő részben az eddig felépített dolgok használatával, és testreszabásával fogunk egy minimális játéklogikát megvalósítani.

10. Játék alapok - A tank
---------------
A játék tehát egy ügyességi játék lesz, amelyben repülő ellenségeket kell lelövöldözni a földön mozgó tankunkból. Ebben a fejezetben létrehozzuk a játékost képviselő tankot, megoldjuk annak irányítását, javítunk a részecskék memória- és processzorhasználatán, és használjuk az előzőekben elkészített robbanást, mint a játékos fegyverét.

A legegyszerűbb lépéssel kezdem, a tisztogatással. Az előző demóban látható volt, hogy amikor kilőttünk valamit, a robbanással keletkező törmelék és ágyúgolyó valószínűleg soha nem került kitörlésre a világból, ezért sok lövés után a render-ciklus akár részecskék ezreit is animálni és rajzolni volt kénytelen. Ez nyilvánvaló pazarlás, hiszen nincs szükség a részecskéknek örök életre. A következőkben a Circle és Square osztályokon bevezetünk egy _.life_ változót, amellyel szabályozhatjuk meddig éljenek a részecskék.

Tehát mind a Square.js-ben, mind a Circle.js-ben az analóg módon megfelelő részeken vigyük fel a következőt:
```javascript
// Tehát a Circle és a Square osztályokban is!

// A konstruktorban:
// Átvesszük a paraméterobjektumról az entitás élethosszát, ha más nincs, akkor végtelen életű
	this.life = options.life || Infinity;
    
// Az .animate függvény legvégén:
// Csökkentjük életét a leanimált idővel, és ha élete kifutott, a világból töröljük
	this.life-= time;
	if (this.life<0) this.world.remove(this);
```
Ez egy azonnali következményként vonzza magával, hogy a _world_ objektumunknak kell, hogy legyen olyan _.remove_ függvénye, amivel törölhető egy objektum a világból. Ezt a _gameScript.js_-ben a world objektumon kell felvegyük, és a következőképp néz ki:

```javascript
var world = {
	gravity: new Vector(0, 200),
	insert: function(entity, asDrawable, asAnimatable) {
		//... ami eddig is
	},
    
	// Ez a függvény képes eltávolítani egy elemet a világ minden referencia tömbjéből
	remove: function(entity){
		// Ha az entitások közt van, vegyük ki
		for (var i=0; i<world.entities.length;i++){
			if (world.entities[i]==entity) {
				world.entities.splice(i,1);
				break;
			}
		}
		// Ugyanígy a rajzolhatókra
		for (var i=0; i<world.drawables.length;i++){
			if (world.drawables[i]==entity) {
				world.drawables.splice(i,1);
				break;
			}
		}
		// És az animálhatókra
		for (var i=0; i<world.animatables.length;i++){
			if (world.animatables[i]==entity) {
				world.animatables.splice(i,1);
				break;
			}
		}
	},
    
    // ...továbbiak...
```
Így megoldjuk tehát, hogyha készítéskor megadnak egy _life_ értéket a részecskének, akkor az annyi millisecundumig fog élni. Eztán kikerül a világból, és nem lesz többé animálva, sem kirajzolva. A tulajdonság beállítására most nem térek ki, az látható lesz a következő kódrészletekben is.

Következő, nehezebb lépésként készítsük el a játékos objektumot, amely a játékos állapotát tárolja, és őt rajzolja ki. Indoklások a kódban komment formában:
```javascript
// Egy objektum a játékosnak
var player = {

	// tároljuk a játékos helyét
	position: new Vector(cWidth/2, cHeight/2),
	// aktuális sebességét
	speed: new Vector(),
	// ágyújának állását egy vektorban
	cannonVector: new Vector(),
    
	// a játékos kirajzolható
	drawTo: function(ctx){
		// rajzoláshoz használjuk ezt a színt
		ctx.fillStyle = "blueviolet";

		// rajzoljunk ki egy kört, ami a tank felső része
		ctx.beginPath();
		ctx.arc(player.position.x, player.position.y, 6, 0, Math.PI*2);
		ctx.fill();

		// rajzoljunk ki egy kissé lefelé eltolt téglalapot, ami a tank teste
		ctx.fillRect(player.position.x-12,player.position.y+6-4,24,8);

		// végül rajzoljunk egy kis pálcikát, ami az ágyú irányába mutat
		ctx.beginPath();
		// a középpontban kezdődik
		ctx.moveTo(player.position.x,player.position.y);
		// és a középponthoz képest az ágyú vektor koordinátáival van eltolva
		ctx.lineTo(player.position.x + player.cannonVector.x, player.position.y + player.cannonVector.y);
		ctx.stroke();
	},
    
    // a játékos animálható is
	animate: function(time){
        // Az ágyúirányt az egér felé mutató vektorral készítjük el
		var mousePos = new Vector(mouse.x, mouse.y);
        // Vegyük a különbségvektort ami a játékostól az egérbe mutat, azt normalizáljuk (1 hosszúvá tesszük) és 15-szörösre nyújtjuk
		player.cannonVector = mousePos.subtract(player.position).normalize().scaleInPlace(15);
		player.position.addInPlace(player.speed.scale(time/1000));
    }
};

// Ha megvagyunk a játékossal, be is szúrhatjuk a világba, hogy lássuk azt!
world.insert(player, true, true);
```

Ha elkészültünk a játékossal, próbáljuk megcsinálni annak iránnyítását. Ezt a billentyűzettel oldjuk meg, amihez már lehet hogy korábban létre is hoztunk egy virtuális billentyűzet objektumot. Ez nagyon hasonlít az egér megoldására. A lényeg, hogy egy virtuális billentyűzet objekumban tároljuk, hogy milyen állapotban van a valós billentyűzet, és animációkor ezt olvassuk ki, és ezzel mozgatjuk a tankot.

Tehát ez kerül a _gameScript.js_ végére:
```javascript
//... előtte az egér eseménykezelők voltak

// Az eddigi var keyboard = {}; helyett->
var keyboard = {
	38:0, // fel
	40:0, // le
	37:0, // bal
	39:0,  // jobb
	87:0, // W - fel
	83:0, // S - le
	65:0, // A - bal
	68:0, // D - jobb
};
// Gomblenyomás esetén beállítjuk azt a tároló objektumunkon
document.onkeydown = function(ev){
	if (ev.keyCode in keyboard){
        // egy 1-essel jelezzük a gomb kódja mögötti értékben, hogy éppen lenyomva van
		keyboard[ev.keyCode]=1;
		return false;
	}
	return true;
};
// Gombfelengedés esetén, ha a gomb a lenyomottak közt van
document.onkeyup = function(ev){
	if (ev.keyCode in keyboard){
        // akkor lenullázzuk a gomb kódja mögötti értéket
		keyboard[ev.keyCode]=0;
		return false;
	}
	return true;
};

// A kód végén marad a renderCiklus első időzítése
window.requestAnimationFrame(gameLoop);
```
Ha már megvan a billentyűzet állapota, akkor nyilvánvalóan ott kell változtatnunk a kódon, ahol az inputokat olvassuk ki, ez pedig a _handleInputs_ függvény.
```javascript
	function(mouse, keyboard) {
		// Számítsuk ki a tank aktuális sebességét a lenyomott gombokból
		player.speed.x = (keyboard[39]+keyboard[68] - keyboard[37] - keyboard[65])*100;
		player.speed.y = (keyboard[40]+keyboard[83] - keyboard[38] - keyboard[87])*100;
        
        /// folyt köv...
```
Ha hagyjuk a _handleInputs_ további részét úgy ahogy volt, vagy szimplán csak kitöröljük, akkor kipróbálhatjuk a játék mostani állpotát, és láthatjuk, hogy a tankunk a WASD vagy a nyíl gombokkal nagyszerűen irányítható a pályán. Persze ez még nem a végleges, de mindig jó látni munkánk gyümölcsét.

A fejezet utolsó lépésében pedig megoldjuk, hogy az elkészített robbanás és ágyúgolyó a tankunk csövéből induljon ki.

Ehhez az előbb félbehagyott _handleInputs_ függvényt kell folytassuk, kitörölve vagy átírva az előző fejezet robbanását megvalósító kódrészletet:
```javascript
    /// folyt köv...
    var mousePos = new Vector(mouse.x, mouse.y);
    
    // kiszámítjuk, hol lenne a tank ágyújának vége, innen kell majd indítani a robbanásokat
    var cannonEnd = player.position.add(player.cannonVector);
    // kiszámíthatunk előre egy vektort ami a játékosból az egérhez vezet, hasznos lesz
    var playerToMouseVector = mousePos.subtract(player.position);
    // Tehát, ha gombnyomást olvastunk, akkor->
    if (mouse.left) {
        // Készítsük el a robbanásunkat (most átmeneti változók nélkül)
        var explosion = new Explosion({
            particles: [new Circle(0,0,{
                    size: 10,
                    color: colors[1],
                    friction: 0.005,
                    world: world,
                    mass: 2,
                    // az ágyúgolyó sebessége legyen 700 és mutasson a játékostól az egér felé
                    speed: playerToMouseVector.clone().normalize().scaleInPlace(700),
                    // és éljen 10mp-ig
                    life: 10000
                })],
                // törmelék generátor
            generator: function() {
                return new Square(0,0,{
                    size: 3,
                    // a színeit válogassa egy globális tömbből (később)
                    color: fireColors[Math.floor(Math.random()*3)],
                    friction: 0.05 + Math.random() * 0.001,
                    world: world,
                    mass: Math.random(),
                    // és éljenek 800-1000ms-t
                    life: Math.random()*200+800
                });
            },
            world:world,
            particlesCount: 10,
            strengthMin: 100,
            strengthMax: 400,
            // 22.5 fokos szórással
            coneWidth:Math.PI/8,
            // a játékos->egér vektor irányának megfelelően
            coneOffset: Math.atan2(-playerToMouseVector.y, playerToMouseVector.x)
        });

        // süssük el az ágyúvég helyzetében (hoppá, új paraméter)
        explosion.fire(cannonEnd);
        mouse.left=0;
    }
}
/// ... további függvények a world objektumon.

// Valami globális helyen, objektumokon kívül:
// Egy tömb, amiben a tűz színeinek megfelelő kódok vannak
var fireColors = ['#FFFF47', '#FFBC42', '#FF5A1D'];
```
Észrevehetjük, hogy nem bonyolult, vagy nehéz a kódrészlet, ami az ágyúgolyó kilövését oldja meg, szimplán csak sokat kell paraméterezgetni, mert általánosra próbáltuk megcsinálni a robbanást az újrafelhasználhatóság miatt.

Apropó robbanás, az előző kódrészlet végén jeleztem, hogy úgy használjuk itt a _.fire()_ függvényt, amit eddig nem csináltunk: megadjuk neki, hogy milyen helyzetből tüzelje a robbanást. Ehhez kell igazítanunk az Explosion osztályunk megfelelő függvényét:
```javascript
Explosion.prototype.fire = function(origin) {
    for (var i = 0; i < this.particles.length; i++) {
        var p = this.particles[i];
        if (p.speed.length() == 0) {
            p.speed = Explosion._conal2(this.coneWidth, this.coneOffset);
            p.speed.scaleInPlace(Explosion._randbetween(this.strengthMin, this.strengthMax));
        }
        // A változás az, hogyha van robbanás eredet megadva, akkor helyezzünk át oda minden részecskét beszúrás előtt
        if (origin){
            p.position.x = origin.x;
            p.position.y = origin.y;
        }
        this.world.insert(p, true, true);
    }
};
```

Szóval, talán végeztünk. A tankunk mozog, és golyókat lő, amiket tűz részecskék kísérnek, és a tank kivételével mindenki engedelmeskedik a gravitációnak. Nagyszerű látvány, nemde?

11. Játék alapok - Ütközésdetektálás
---------------

12. Játék alapok - Rugalmas ütközés
---------------

13. Rendszerezés, refaktorálás
---------------

14. Játék logika - Ellenségek
---------------

    

_A leírást készítette: Szabó Alex, `<time datetime="2015-04-10 19:00">2015</time>`_
