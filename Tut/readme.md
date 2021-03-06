Játék készítése Javascript-ben, Canvas-szel
-------------------------------------------

(Megjegyzés: talán 2021-ben már nem tűnik relevánsnak a példakód, mert sok javascript eszköz modernebb alternatívákkal kiváltható, de szerintem a feladat végigvezetése és az ott szemléltetett módszerek és gondolkodás még mindig releváns lehet egy kezdő/középhaladó web-programozó számára.)

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
15. [Vége](#15-fin)

Az út hosszú, de tanulságos. A forráskódot folyamatosan javítjuk és szépítjük, hogy a végén egy jól áttekinthető kódunk legyen.

## 1. A projekt alapjai

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

Végeredmény: http://delanni.github.io/webfejl/lvl1/

## 2. A canvas és a renderloop alapjai

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

Végeredmény: http://delanni.github.io/webfejl/lvl2/

## 3. A játékvilág és rajzolás a canvas-en

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

Végeredmény: http://delanni.github.io/webfejl/lvl3/

## 4. Játékelemek animációja

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

Végeredmény: http://delanni.github.io/webfejl/lvl4/

## 5. Vektor és négyzet osztályok, példányosítás

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

Végeredmény: http://delanni.github.io/webfejl/lvl5/

## 6. Inputkezelés

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

Végeredmény: http://delanni.github.io/webfejl/lvl6/

## 7. Pszeudo-fizikai megközelítés

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

Végeredmény: http://delanni.github.io/webfejl/lvl7/

## 8. Pszeudo-fizika, gravitáció


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

Végeredmény: http://delanni.github.io/webfejl/lvl8/

## 9. Ágyú és robbanások

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

Végeredmény: http://delanni.github.io/webfejl/lvl9/

## 10. Játék alapok - A tank

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

Végeredmény: http://delanni.github.io/webfejl/lvl10/

## 11. Játék alapok - Ütközésdetektálás

A játékokban az ütközésdetektálás fontos pont. A játékok legtöbb mechanikája és logikája valamilyen formában arra épül, hogy egyes egységek, entitások ütköznek. Ezt detektálni nem mindig triviális feladat, de a mi esetünkben (mivel nagyon egyszerű entitásaink vannak) könnyen megoldható. 

Két négyzet közti ütközés az AABB módszerrel megoldható, de leegyszerűsíthető a bennfoglaló körök ütköztetésére. És a körök ütközésének detektálása pedig teljesen triviális: ha középpontjaik távolsága kisebb mint a sugarak összege, akkor ütköznek.

Két dolgot megkülönböztethetünk az ütközésdetektálás implementálása során: magát az ütközés detektálást, és az ütközés választ. Ebben a lépésben főként az ütközés detektálást készítjük el, ütközésválaszként egy egyszerű, jelzés értékű logolást teszünk.

Ez tehát 2 függvényt indokol azokon az osztályokon, objektumokon, akiket ütköztetni szeretnénk, egy _.intersects(other)_ és egy _.handleCollisionWith(other)_ függvényt. Most gondoljunk bele, hogy ki az akit valaha is ütköztetni szeretnénk?

Az ellenségeket és a lövedékeket, és most megsúgom, hogy az egyszerűség kedvéért az ellenséget a lövedékből fogjuk származtatni. Így tehát elég lenne csak a Circle osztályon megírni, de a példa kedvéért megírhatjuk a játékoson is. 

Először helyezzük el ezt a két függvényt a játékos objektumunkon:
```javascript
var player = {
    // ... előző függvényeken túl
    
    // ...
    // Egy függvény az ütközésdetektálásra
    intersects: function (other) {
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
        var distance = other.position.subtract(player.position).length();
        // Ha ez a tavolsag kisebb mint a ket bennfoglalo kor sugaranak osszege, akkor metszik egymast
        if (distance < (playersBoundingCircleRadius + boundingCircleRadius)) {
            return true;
        } else {
            return false;
        }
    },
    // Az ütközésválasz pedig egy egyszerű logolás
    handleCollisionWith: function (other) {
        // Ki ütközött kivel?
        console.log(this, "collided", other);
    }
};
```

Ehhez nagyon hasonló lesz a Circle osztály ütközésdetektálása és válasza:
```javascript
// Ugyanaz mint a játékosnál kb.
Circle.prototype.intersects = function (other) {
    // itt nem kell külön bennfoglaló kört becsülni a körnek, hiszen a this.size pont az
    if (other instanceof Square) {
        var boundingCircleRadius = other.size * Math.sqrt(2) / 2;
    } else if (other instanceof Circle) {
        var boundingCircleRadius = other.size;
    }
    var distance = this.position.subtract(other.position).length();
    if (distance < (this.size + boundingCircleRadius)) {
        return true;
    } else {
        return false;
    }
};

// És az ütközésválasz is
Circle.prototype.handleCollisionWith = function (other) {
    console.log(this, "collided", other);
};
```

Szóval megvagyunk, felkészítettük a fontosabb entitásokat az ütköztetésre, már csak egy olyan logika kell, aki végigteszteli párosával az összes entitást, és megnézi, hogy ütköznek-e. Mivel ez egy minden körben lefutó ciklusnak néz ki, és nem függ a felhasználói inputtól, így érdemes lehet új függvényt készítenünk a számára a _world_ objektumunkon.

Helyezzük tehát valahova a world objektumunkra ezt a függvényt
```javascript
var world = {
    // többi tulajdonság, és függvény...
    
    // ...

// Ez a függvény végigmegy az összes entitáson, és próbálja őket ütköztetni
    checkCollisions: function () {
        // Vegyük sorra az összes elemet
        for (var i = 0; i < world.entities.length; i++) {
            // Majd minden elemhez vegyük sorra az utána következőket, így egy páros csak egyszer kerül vizsgálatra
            for (var j = i + 1; j < world.entities.length; j++) {
                // Vegyük ki a páros elemeit 1-1 változóba
                var e1 = world.entities[i];
                var e2 = world.entities[j];

                // Ha mindkét elem kezel metszést
                if (e1.intersects && e2.intersects) {
                    // és ha az egyik elem metszi a másikat, és van ütközés kezelő függvénye
                    if (e1.intersects(e2) && e1.handleCollisionWith) {
                        // akkor hívjuk meg az ütközés kezelő függvényét
                        e1.handleCollisionWith(e2);
                    }
                    // ugyanez a másik irányban is
                    if (e2.intersects(e1) && e2.handleCollisionWith) {
                        e2.handleCollisionWith(e1);
                    }
                }
            }
        }
    },
    
    /// stb.
};

// És ezt a gameLoop játékciklusunkban valahol hívjuk is meg, hogy végrehajtsuk minden körben:
var gameLoop = function (t) {
    // ... 
    
    // mondjuk az inputkezelés és a világ szimuláció közt ütközést detektálhatunk
    world.handleInputs(mouse, keyboard);
    world.checkCollisions();
    world.simulate(delta);
    // ...
};
```
Ezzel tehát minden körben párosával összevetjük és üzköztetjük a játékosunkat és az ágyúgolyókat, az eredményét pedig a konzolon láthatjuk (F12, ha eddig nem nézted volna). Akkor történik ütközés, ha két golyó metszi egymást, vagy ha visszapottyan egy golyó a tankunkra.

Még egy apró dolgot megtehetünk itt, jó lenne lekorlátozni, hogy a tank csak balra és jobbra tudjon menni a földhöz közeli sávon. Ehhez TÖRÖLNI KELL a WS és a fel-le gombokat kezelő sort, és a tankot a földhöz közeli helyre kell tenni a képernyő közepe helyett.
```javascript
 // ez a sor felelős a függőleges mozgatásért (handleInputs függvény eleje)
 // töröljük tehát ki
 player.speed.y = (keyboard[40]+keyboard[83] - keyboard[38] - keyboard[87])*100;
 
 // valamint a player objektum elkészítésekor más helyre inicializáljuk
 var player = {
    // tároljuk a játékos helyét (tegyük a földre)
    position: new Vector(cWidth / 2, cHeight - 12),
    
    // a többi rész érintetlen marad...
```

A következő lépésben egy nagyon jópofa és látványos dolgot fogunk megcsinálni, ami sokkal egyszerűbb, mint aminek tűnik: rugalmas ütközést a golyók közt.

Végeredmény: http://delanni.github.io/webfejl/lvl1/

## 12. Játék alapok - Rugalmas ütközés

A rugalmas ütközés is egy olyan dolog, amit az emberi agy már nagyon természetesen kezel, és előre becsül, ezért annyira jó látni a játékokban, és annyira rossz, ha nem úgy működik ahogy kellene neki.

Az egész egy 2 dimenziós képleten alapszik, amit a [rugalmas ütközés](http://en.wikipedia.org/wiki/Elastic_collision#Two-Dimensional_Collision_With_Two_Moving_Objects) ezen bekezdésének végén láthatunk. Az ott adott változók (x1,x2,v1,v2) vektorok, tehát a vektorműveleteket kell rájuk értelmeznünk. A < > jelekkel itt a skalárszorzatot jelzik, szóval már ugorhatunk is a Vector.js-hez, hogy kiterjesszük a skalárszorzat implementációval:
```javascript
Vector.prototype.scalar = function(other){
    return other.x * this.x + other.y * this.y;
};
```

Ezután már tudjuk értelmezni a képletet, és nem is tűnik olyan nehéznek átírni javascript megfelelőre. 

A kérdés, hogy hol kell ezt alkalmaznunk? Mivel egyelőre nem szeretnénk, hogy a játékosunk rugalmasan ütközzön, csak a golyók egymás közt, így csak a Circle osztályt kell felokosítanunk. Az eddigi logolás helyett implementáljuk a képlettel adott rugalmas ütközést:
```javascript
// Próbáljunk meg rugalmas ütköztetést szimulálni
Circle.prototype.handleCollisionWith = function (other) {
    // Csak a másik körrel való ütközés esetén
    if (other instanceof Circle) {
        // a képletben szereplő változók
        var v1 = this.speed;
        var x1 = this.position;
        var m1 = this.mass;
        var v2 = other.speed;
        var x2 = other.position;
        var m2 = other.mass;
        
        // egyszerűsítésként a képletben előforduló vektorkülönbségek
        var x12Diff = x1.subtract(x2);
        var x21Diff = x2.subtract(x1);
        
        // a képletek megoldása v1 és v2-re
        var v1New = v1.subtract(x12Diff.scale(2 * m2 / (m1 + m2) * v1.subtract(v2).scalar(x12Diff) / Math.pow(x12Diff.length(), 2)));
        var v2New = v2.subtract(x21Diff.scale(2 * m1 / (m1 + m2) * v2.subtract(v1).scalar(x21Diff) / Math.pow(x21Diff.length(), 2)));
        
        // a kiszámolt értékek lesznek az új sebességei az ütköző entitásoknak
        this.speed = v1New;
        other.speed = v2New;
    }
};
```
Mivel látható, hogy egy objektum ütközésválaszában lekezeljük a teljes rugalmas ütközést, és beállítjuk mindkét fél sebességét, így sejthető, hogy hibához vezetne, ha engednénk mindkét félnek külön-külön meghívni ezt a függvényt ütközéskor, mert akkor 2x történne meg minden, tehát a 2 ütközés 2 sebességcserét eredményezne, ami úgy nézne ki, mintha semmi sem történt volna.

Ennek orvoslására két dolgot tehetünk:
 * az ütközéskezelő függvényben NEM állítjuk be a másik objektum sebességét, és így végrehajthatjuk a vissza irányú ütköztetést is
 * az ütköztetés során mindig csak egy irányban, egyszer ütköztetünk minden párosra

Ha kipróbálnánk az első megoldást, ami programozási szempontból ésszerűbbnek tűnik, hiszen miért törődne az egyik objektum a másikkal mikor ütközik, akkor láthatnánk, hogy mivel a képlet az ütközés pillanatában számítandó mindkét entitás sebességére, azzal, hogy egymás után számítjuk ki a képlet eredményét, rossz viselkedést kapunk. Mire a második ütköztetés jön, addigra az első objektum már sebességet változtatott, tehát a második ütközésnek rossz lesz az inputja.

Tehát maradjunk a második megoldásnál: az ütközés kezelés maradjon ahogy most van, egy függvényhívás beállítja mindkét fél sebességét. Azonban töröljük ki azt a részt, amely mindkét irányban ütközteti a vizsgált entitáspárokat: (_gameScript.js_ _world.checkCollisions_ függvény)
```javascript
    // Ha mindkét elem kezel metszést
    if (e1.intersects && e2.intersects) {
        // és ha az egyik elem metszi a másikat, és van ütközés kezelő függvénye
        if (e1.intersects(e2) && e1.handleCollisionWith) {
            // akkor hívjuk meg az ütközés kezelő függvényét
            e1.handleCollisionWith(e2);
        }
        // Ezt kell kitörölni -->
        /*
        if (e2.intersects(e1) && e2.handleCollisionWith) {
            e2.handleCollisionWith(e1);
        }
        */
    }
```
Ezzel megoldottuk, hogy csak egy irányban történik az ütközés, és mivel csak a kör osztályunkra írtuk meg, így az eredményt akkor látjuk, ha két golyót egymásnak lövünk. Célózzunk tehát az ég felé, és próbáljuk meg eltalálni a zuhanó ágyúgolyóinkat. 

Kozmetikai jelleggel megoldható, hogy az ágyúgolyók ne mindig egyszínűek legyenek, és jobban érzékeljük az ütközésüket. Ezért generálhatunk véletlen színt minden új kilőtt golyónak. 

Ezt természetesen a _gameScript.js_-ben tehetjük meg, azon a részen, ahol a kattintást kezeljük, és ennek hatására robbanást generálunk. A megváltoztatandó kódsort a következő részletben kommenttel jelölöm:

```javascript
/// ... world.handleInputs függvényében
if (mouse.left) {
            var explosion = new Explosion({
                particles: [new Circle(0, 0, {
                    size: 10,
                    // A color: ... sort változtassuk meg erre, hogy véletlenszerűen generáljunk új színeket
                    color: "hsl(" + Math.floor(Math.random()*360) + ",100%,50%)",
                    friction: 0.005,
                    world: world,
                    mass: 2,
                    speed: playerToMouseVector.clone().normalize().scaleInPlace(700),
                    life: 10000
                })],
```

Végeredmény: http://delanni.github.io/webfejl/lvl12/

## 13. Rendszerezés, refaktorálás

Ebben a lépésben nem fogunk új képességet vinni a játékba, hanem inkább megpróbáljuk a kódot egy kicsit rendbetenni, mielőtt az utolsó felvonást elkezdjük. A refaktorálás általában kód újraszervezést jelent, a mi esetünkben most ez csak annyit jelent, hogy a játékos és világ objektumainkból olyan osztályokat csinálunk, amelyekkel számos játékost, vagy világot tudnánk generálni. Még ha csak 1-1 darabot is akarunk készíteni belőlük, érdemes osztályokba szervezni őket, hogy ne egy fájlt szennyezzünk tele a nem igazán releváns kódrészletekkel. Így tehát kivonunk egy csomó kódot a _gameScript.js_-ből, és létrehozzuk a _Player.js_-t, és a _World.js_-t, és közben megtanulunk egy másik módszert az osztályok szimulálására.

Kezdjük a World osztállyal, hozzuk létre a World.js-t, hivatkozzuk be az _index.html_-ben, és másoljuk át bele a _gameScript.js_-ben lévő _world_ változónkat, majd alakítsuk osztállyá.
```javascript
// Legyen a World függvény a konstruktor
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
    
    // mire idáig eljutunk, a kezdetben üres this objektum már rendelkezik minden olyan tulajdonsággal és függvénnyel, ami ahhoz kell, hogy worldként viselkedjen.
    // Így is lehet osztályokat szimulálni. a konstruktorfüggvényben a this-re aggatunk rá minden tulajdonságot és függvényt.
};
```
Láthattuk, hogy egy objektum kulcsai helyett a _this_ objektumot kezeltük úgy, mint az éppen készítendő _World_ példányt, és rajta állítottunk be tulajdonságokat és függvényeket.

Ennek mintájára megcsinálhatjuk a játékos osztályt, a _Player.js_ fájlba:
```javascript
// A játékos osztályunk is hasonló az összes többihez, egy-az-egyben az objektumpéldányt alakíthatjuk át osztállyá.
var Player = function (options) {
    // A tulajdonságokat ráaggatjuk a this objektumra, aki az elkészítendő példányt jelenti
    this.position = options.position || new Vector();
    this.speed = new Vector();
    this.cannonVector = new Vector();
    this.color = options.color || "blueviolet";

    // A függvényeket a this-re is rátehetjük, hiszen akkor is megjelenik a játékoson
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
        var playersBoundingCircleRadius = 8;
        
        if (other instanceof Square) {
            var boundingCircleRadius = Math.sqrt(2) * other.size / 2;
        } else if (other instanceof Circle) {
            var boundingCircleRadius = other.size;
        }
        var distance = other.position.subtract(this.position).length();
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

        if (mouse.left) {
            var explosion = new Explosion({
                particles: [new Circle(0, 0, {
                    size: 10,
                    color: "hsl(" + Math.floor(Math.random() * 360) + ",90%,40%)",
                    friction: 0.005,
                    world: _world,
                    mass: 2,
                    speed: playerToMouseVector.clone().normalize().scaleInPlace(700),
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
                particlesCount: 10,
                strengthMin: 100,
                strengthMax: 400,
                coneWidth: Math.PI / 8,
                coneOffset: Math.atan2(-playerToMouseVector.y, playerToMouseVector.x)
            });

            explosion.fire(cannonEnd);
            mouse.left = 0;
        }
    };
};
```

Mivel már van egy olyan osztályunk, amivel világokat tudunk példányosítani, és egy olyan is, amivel játékosokat, a _gameScript.js_-ben leegyszerűsíthetjük ezeket a részeket. Tehát ott ahol a world és a player változókat elkészítjük:
```javascript
var world = new World();
var player = new Player({
    position: new Vector(cWidth/2, cHeight-12),
    color: "#71c"
});
world.insert(player, true, true);
```

Ugye mennyivel szebb és átláthatóbb? Nyilván nagyon sok nem-triviális részletet rejtettünk el a _World_ és _Player_ osztályokban, de azoknak igazából ott is a helyük, és nem a játék magasabb absztrakciós szintű nézetével egy helyen.

Ha mindent jól csináltunk, a játékunk ugyanúgy fut ahogy eddig, annyi változott csak, hogy a _world_ és a _player_ példányaink példányosítással készülnek objektum literálok helyett, és másik fájlokban tároljuk az osztályok definícióját.

Végeredmény: http://delanni.github.io/webfejl/lvl13/

## 14. Játék logika - Ellenségek

Rövid szusszanás után egy utolsó nagy lépésben értelmet adunk eddigi fáradozásainknak azzal, hogy célpontokat és pontozást teszünk a játékba.

Ha mindent jól csináltunk eddig, akkor a játékunkban egy mozgatható kis tank játékos van, aki golyókat tud lövöldözni. Ennek még célja nincs. Ezért behozunk ellenségeket, akiket lőni lehet, és ezzel pontot gyűjteni.

Készítsük el először az ellenségeket reprezentáló osztályt. Mivel azt szeretnénk, hogy a játékban a látvány javítása céljából az ellenségek is ütközzenek az ágyúgolyókkal, ezért átmásolhatnánk a rugalmas ütközés logikáját kézzel az Enemy osztályunk megfelelő részére, és felkészítenénk mindkét kódot arra, hogy egymással tudjanak ütközni. Ugyanakkor, a példa kedvéért itt megmutatom nektek hogy hogyan lehet a javascriptben szimulálni az objektumorientált világ öröklés koncepcióját. 

Amikor egy osztály örököl egy másikból, az azt jelenti, hogy az ősosztály példányának minden tulajdonsága megjelenik a leszármazott példányában. És a leszármazott osztály még új dolgokkal is ki tudja terjeszteni a saját példányát az ősön túl. Mivel javascriptben nincs klasszikus öröklés, csak prototípusok, így ezt kicsivel nehezebb megoldani.

A logika amit itt alkalmazunk két lépésből áll:
 1 amikor a leszármazott objektumot konstruáljuk, akkor hívjuk meg a leszármazottra az ős konstruktorát is, hogy az be tudja állítani a saját magának megfelelő tulajdonságokat a konstruktor paraméterben kapott értékekből
 2 a leszármazott osztály (függvény) prototípusának állítsuk be az ősosztály 1 db példányát, így minden rajta definiált függvény megjelenik az összes leszármazott példányon.
 
_Megjegyzés: ha a World és Player osztályoknál használt osztály szimulációs módszert használnánk (amikor nem a prototípus objektumon állítunk be függvényeket, hanem a konstruktorban készítünk függvény példányokat), akkor a második lépés itt felesleges lett volna, hiszen amikor az őskonstruktort meghívjuk, az elkészíti az összes függvényét a leszármazott példányán is._

Ez a sok bonyolult zagyva után lássuk a kódot:
```javascript
var Enemy = function (x, y, options) {
    // Ez az első említett lépés: az ős konstruktorát meghívjuk az éppen készülő Enemy példányon, a this-en
    Circle.apply(this, arguments);

    // Ezek után további, csak az Enemy-re jellmző tulajdonságokat beállíthatunk a példányon:
    
    // Saját kép paraméterei, ami alapján kirajzolásra kerül az ellenség képe
    this.planeCoords = this.planes[options.planeId || 0];
    // a this.planes[] tömb majd a prototípusra kerül rá, így minden példány látni fogja, és a választható repülőgép kép koordinátákat tartalmazza
    this.planeId = options.planeId;
    this.currentPointValue = 1;
};

// És készítsünk el egy példányt a Circle-ből, ez a második említett lépés
Enemy.prototype = new Circle();
```
Ezzel tehát logikailag leszármaztunk a Circle osztályból. Amikor létrehozunk egy új Enemy példányt, akkor az tökéletesen úgy fog kinézni, és viselkedni, mint egy Circle példány, mint egy ágyúgolyó például. Ezért írjuk felül az Enemy prototípusán néhány függvényt, pl. a kirajzolást és az ütközésválaszt (így tehát az animálást és az ütközésdetektálást nem kell újraírnunk, de az öröklés miatt elérhetők).

Először a kirajzolást írjuk folytatva az Enemy osztályt:
```javascript
// Azzal, hogy az elkészült prototípuson felülírunk egy függvényt, gyakorlatilag felülírjuk a kirajzolást 
// minden leendő Enemy példányon, ami tulajdonképpen a célunk, hiszen az ellenségeket másképp szeretnénk kirajzolni
Enemy.prototype.drawTo = function (ctx) {
    // Használjuk a kontextuson adott .drawImage függvényt
    // paraméterezése:
    // mit, honnanX, honnanY, honnanSzél, honnanMag, hovaX, hovaY, hovaSzél, hovaMag
    ctx.drawImage(this.image,
        this.planeCoords.x, this.planeCoords.y, this.planeCoords.width, this.planeCoords.height,
        this.position.x - this.size / 2, this.position.y - this.size / 2, this.size, this.size);
};
```

Ha felül akarunk írni egy ősből örökölt függvényt, akkor az eltűnik teljesen. A mi esetünkben az ütközés választ nem szimplán felül akarjuk írni, hanem kiterjeszteni akarjuk, tehát az eredeti rugalmas ütközésen kívül szeretnénk szikrákat szórni egy _Explosion_ segítségével.
Ehhez azt tehetjük, hogy elmentjük az eredeti ütközésválaszt, valamilyen más néven, majd az ütközésválaszt felülírjuk, és a kiterjesztés során valahol meghívjuk az eredeti, elmentett függvényt is. Ezzel megtörténik az eredeti rugalmas ütközés, és az is, amit mi szeretnénk hozzátenni az ellenség osztályban:
```javascript
// Elmentjük az örökölt függvényt
Enemy.prototype.parentCollide = Enemy.prototype.handleCollisionWith;
// Felülírjuk az örökölt függvényt
Enemy.prototype.handleCollisionWith = function (other) {
    if (other instanceof Enemy || other instanceof Square) return;

    // Ütközés után beszínezzük másfélére a repülőt, úgy hogy másik képet használunk
    this.planeCoords = this.planes[this.planeId + 2];
    // Gyorsulását lenullázzuk, amivel zuhanásba kezd a gravitáció miatt
    this.acceleration.scaleInPlace(0);

    // Készítünk egy formás robbanást
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
    // és azt elsütjük a repülő helyén
    expl.fire(this.position);

    // Majd meghívjuk az eredeti ütközésválasz függvényt, ami rugalmasan ütközteti a két testet.
    this.parentCollide(other);
    
    // A repülőnek lecsökkentjük a tömegét, hogy ne zuhanjon túl gyorsan
    this.mass = other.mass;

    // A világ referenciánkon jelezzük, hogy pontot ér a találat
    this.world.yieldPoints(this.currentPointValue);
    // És növeljük a pontértéket, hogy a zuhanó repülő többet érjen
    this.currentPointValue *= 2;
    // De max 16-ot
    if (this.currentPointValue > 16) this.currentPointValue = 0;
};
```

Ezzel elméletileg megvagyunk az ellenség osztálynak a logikai részével. Már csak a vizuális részén kell javítanunk valamennyit. Ehhez be kell töltenünk egy _img_ tagbe egy képet, hogy használhassuk rajzolás alapjául, és elmentjük az Enemy osztály prototípusára a képet és a képen lévő objektumok logikai helyét.
_Megjegyzés: a képen lévő koordinátákat és szélességeket kézzel mértem ki, és az alapján állítottam össze a tömböt ami tárolja ezeket_

Folytassuk tehát ezzel az _Enemy.js_-t:
```javascript
// Mivel ez az osztály behúzásakor lefutó javascript kód, ezért lehetőségünk van bármit csinálni. Például behúzhatunk egy kép fájlt
// amiből később ki tudunk másolni sprite-okat a képernyőre. Mivel az ellenségek vannak ezen a képen, ezért itt behúzhatjuk.

// Készítsünk egy üres IMG taget
var atlas = document.createElement("img");
// az atlaszunk onload függvénye AKKOR hívódik meg, ha a kép sikeresen betöltődött
atlas.onload = function () {
    // Ekkor tároljuk le az ellenség prototípusán a referenciát a képre
    Enemy.prototype.image = atlas;
    // És az objektumot, ami tárolja a képek részleteinek koordinátáit
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
// Rejtsük el a kis képeket tartalmazó elemet
atlas.style.display = "none";
// Amint hozzáadjuk az img elemet és beállítjuk annak forrását, elkezdi a böngésző letölteni a képet
document.body.appendChild(atlas);
atlas.src = "planes.png";

// Források
// http://opengameart.org/content/tappy-plane
```
Nagyszerű! Most már meg is jelenne a repülőnk, ha hozzáadnánk egy példányt a játékhoz. Mozogjunk tehát át a _gameScript.js_-be, hogy hozzá tudjuk adni az ellenség példányokat a világhoz.

Tegyük a következőt: indítsunk egy egyszerű időzítőt, ami fél másodpercenként próbálkozik, és valamilyen eséllyel hozzáad egy új ellenséget a pályához véletlenszerű tulajdonságokkal.
```javascript
// Az időzítő függvényekkel működik, amit meghívhat
var addEnemy = function () {
    // A függvény ne mindig adjon hozzá új repülőt, csak az esetek 70%-ában
    if (Math.random() >= 0.7) {
        var x, xspeed, id;
        // Ha már hozzáadunk repülőt, akkor az 50-50%-ban balra vagy jobbra kerüljön
        if (Math.random() > 0.5) {
            // Melyik oldalon kezdjen?
            x = cWidth;
            // Merre menjen?
            xspeed = -50 - Math.random() * 50;
            // Melyik modellt használja?
            id = 0;
        } else {
            x = 0;
            xspeed = 50 + Math.random() * 50;
            id = 1;
        }
        // A magasság is legyen randomizált bizonyos keretek közt
        var y = cHeight - 150 - Math.random() * (cHeight-200);
        
        // Készítsük el a generált paraméterekkel az ellenség példányt
        var enemy = new Enemy(x, y, {
            size: 50,
            life: 15000,
            // Menjen a kép másik oldala felé
            speed: new Vector(xspeed,0),
            // Legyen pont a gravitációt kiegyenlítő gyorsulása
            acceleration: world.gravity.scale(-1),
            friction:0,
            // és kezdetben az ágyúgolyónál nagyobb tömege
            mass: 10,
            planeId: id
        });
        
        // Majd adjuk hozzá ezt az ellenséget a világhoz.
        world.insert(enemy,true,true);
    }
};

// Időzítsük ezt fél másodpercenkénti végrehajtásra
window.setInterval(addEnemy, 500);
```

Ha most kipróbálnánk a játékot, és nem raktunk volna egy apró utalást egy későbbi feature-re, akkor azt láthatnánk, hogy az ellenségek megjelennének, repülnének, és lelőhetők lennének. Mindez annak köszönhető, hogy az ellenségek a körökből származnak, amelyek pedig animálhatók, és animációjuk során helyüket változtatják a sebességük irányában... minden visszautal az első pár fejezetben elkészített aprócska, jelentéktelennek tűnő részletre.

Fejezzük be tehát az utolsó hiányzó kirakós darab beillesztését, oldjuk meg a pontok számolását és megjelenítését. A pontok számolását a Wolrd példányokon oldottam meg, amelyek számára a _.yieldPoints(p)_ függvénnyel lehet pontokat jelenteni. A World példányok dolga hogy számítsák azt, és a képernyőn frissítsék a megjelenítését.

Menjünk tehát a _World.js_-be, és egészítsük ki azt:
```javascript
// Az osztály elején vigyünk fel egy tagváltozót a pontok karbantartására, és egy függvényt ennek jelentésére:

var World = function () {
    // A tulajdonságokat a this objektumra tehetjük
    this.gravity = new Vector(0, 200);
    this.entities = [];
    this.drawables = [];
    this.animatables = [];
    
    this.points = 0;
    
    this.yieldPoints = function(amount){
        this.points += amount;
    };
    
    // ... többi World függvény
    
    // Egészítsük ki az összes entitást kirajzoló ciklust egy apró dologgal:
    // Még mindig a konstruktoron belül
    this.draw = function (ctx) {
        for (var i = 0; i < this.drawables.length; i++) {
            var drawable = this.drawables[i];
            drawable.drawTo(ctx);
        }
        // Rajzoljuk ki az aktuális pontokat 30px méretben
        ctx.font = "30px sans-serif";
        // Középre igazítva
        ctx.textAlign = "center";
        // A szöveg felső pontjával csatolva
        ctx.textBaseline = "top";
        // A képernyő feléhez, 20 magasságban a következő szöveget:
        ctx.strokeText("Points:" + this.points, cWidth / 2, 20);
    };
    
```
És kész. A gép elkészült. Remélem tényleg nem felejtettünk ki semmilyen apró részletet, amitől ne működne a nagy egész.

Próbáljátok ki!

Hát nem nagyszerű látni, hogy azokból az egyszerű, demó-szerű, szimulációs apróságokból, amiket az első pár fejezetben készítettünk, hova nőtte ki magát a játék? A sok apró részlet együtt működve egy látványos, és összetett, de mégis működő egészet alkot!

Ezzel befejezem a példafeladat leírását. Nyugodtan folytassátok, gondoljátok tovább saját fejlődésetek és kíváncsiságotok javára a játékot. De mindenek előtt próbáljátok felfogni és megérteni azt amit eddig összehoztunk.

Ez már tényleg a végeredmény: http://delanni.github.io/webfejl/lvl14/

## 15. Fin

Remélem fejlődött a javascript programozói gyakorlatotok, és az általános webfejlesztői szemléletetek.

A következőkben néhány olvasnivaló linket sorolok fel:
 * [Javascript nyelvi tulajdonságok](http://en.wikipedia.org/wiki/JavaScript#Features)
 * [Prototípus öröklés](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
 * [Osztály minták](http://arjanvandergaag.nl/blog/javascript-class-pattern.html)
 * [Javascript tervezési minták](http://addyosmani.com/resources/essentialjsdesignpatterns/book/)
 * [További tutorialok](http://superherojs.com/)
 * [Az airBnB kódolási stíluskészlete](https://github.com/airbnb/javascript)


_A leírást készítette: Szabó Alex, 2015_
