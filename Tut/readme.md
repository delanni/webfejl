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

3. A játékvilág és rajzolás a canvas-en
---------------

4. Játékelemek animációja
---------------

5. Vektor és négyzet osztályok, példányosítás
---------------

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

    

_A leírást készítette: Szabó Alex, <time datetime="2015-04-10 19:00">2015</time>_
