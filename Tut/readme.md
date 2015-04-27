Játék készítése Javascript-ben, Canvas-szel
-------------------------------------------

A következőkben egy meglehetősen hosszú cikkben végigviszem egy egyszerű HTML5 játék fejlesztését az alapoktól a kész játékig. A fejlesztés során nem használok mást, mint a HTML5 Javascript és Canvas eszköztárát, és egy külső forrásból származó képet.

A javascript a böngészők által futtatott scriptnyelv/programozási nyelv. A legfőbb használati területe a weboldalak interaktívvá tétele felhasználói input kezeléssel, animációval, és programozott eseményekkel. A javascript futtatómotorok kifinomultságának köszönhetően olyan jó végrehajtási sebességgel rendelkeznek a böngészők, hogy játékokat is készíthetünk kizárólag kliens oldali kóddal. A játékok javascript kód formájában íródnak, és megjelenítéshez a HTMLCanvasElement példányait, a \<canvas\> elemeket használják.

Az elkészülő játék egy egyszerű ügyességi játék lesz, amiben egy tankkal kell repülőket lelőni. A játék esztétikai célból némi fizikát és részecskerendszert is tartalmaz, a játéklogikához szükséges mozgatás, megjelenítés és ütközésdetektálásokon kívül. A fejlesztés 14 nagyobb lépésben történik. Ezek sorban a következők:

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

Ha ezután elindítjuk a játékot, látjuk, hogy sok négyzet példány megjelent a képen, és izegnek-mozognak. Ezzel megtanultuk az osztályok és a példányosítás alapjait. Ezt akkor érdemes használni, tehát, ha sok hasoló viselkedésű objektumot szeretnénk csinálni a játékban (pl.: pénzérmék, ellenségek, lövedékek).

Ez utóbbi szintaxis már kezd eléggé hasonlítani a C#-ban megszokottakhoz. A nagybetűs függvényeket (Vector, Square) úgy használhatjuk, mintha osztályokat jelképeznének, és a _new_ kulcsszóval példányosíthatjuk őket.

6. Inputkezelés
---------------

7. Pszeudo-fizikai megközelítés
---------------

8. Pszeudo-fizika, gravitáció
---------------

9. Ágyú és robbanások
---------------

10. Játék alapok - A tank
---------------

11. Játék alapok - Ütközésdetektálás
---------------

12. Játék alapok - Rugalmas ütközés
---------------

13. Rendszerezés, refaktorálás
---------------

14. Játék logika - Ellenségek
---------------

    

_A leírást készítette: Szabó Alex, `<time datetime="2015-04-10 19:00">`2015`</time>`_
