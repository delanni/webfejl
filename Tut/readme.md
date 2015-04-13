Játék készítése Javascript-ben, Canvas-szel
-------------------------------------------

A következőkben egy meglehetősen hosszú cikkben végigviszem egy egyszerű HTML5 játék fejlesztését az alapoktól a kész játékig. A fejlesztés során nem használok mást, mint a HTML5 Javascript és Canvas eszköztárát, és egy külső forrásból származó képet.

A javascript a böngészők által futtatott scriptnyelv/programozási nyelv. A legfőbb használati területe a weboldalak interaktívvá tétele felhasználói input kezeléssel, animációval, és programozott eseményekkel. A javascript futtatómotorok kifinomultságának köszönhetően olyan jó végrehajtási sebességgel rendelkeznek a böngészők, hogy játékokat is készíthetünk kizárólag kliens oldali kóddal. A játékok javascript kód formájában íródnak, és megjelenítéshez a HTMLCanvasElement példányait, a \<canvas\> elemeket használják.

Az elkészülő játék egy egyszerű ügyességi játék lesz, amiben egy tankkal kell repülőket lelőni. A játék esztétikai célból némi fizikát és részecskerendszert is tartalmaz, a játéklogikához szükséges mozgatás, megjelenítés és ütközésdetektálásokon kívül. A fejlesztés 14 nagyobb lépésben történik. Ezek sorban a következők:

1. [A projekt alapjai](#1-a-projekt-alapjai)
2. [A canvas és a renderloop alapjai](#2a-canvas-es-a-renderloop-alapjai)
3. [A játékvilág és rajzolás a canvas-en](#3a-jatekvilag-es-rajzolas-a-canvas-en)
4. [Játékelemek animációja](#4jatekelemek-animacioja)
5. [Vektor és négyzet osztályok, példányosítás](#5vektor-es-negyzet-osztalyok-peldanyositas)
6. [Inputkezelés](#6inputkezeles)
7. [Pszeudo-fizikai megközelítés](#7pszeudo-fizikai-megkozelites)
8. [Pszeudo-fizika, gravitáció](#8pszeudo-fizika-gravitacio)
9. [Ágyú és robbanások](#9agyu-es-robbanasok)
10. [Játék alapok - A tank](#10jatek-alapok---a-tank)
11. [Játék alapok - Ütközésdetektálás](#11jatek-alapok---utkozesdetektalas)
12. [Játék alapok - Rugalmas ütközés](#12jatek-alapok---rugalmas-utkozes)
13. [Rendszerezés, refaktorálás](#13rendszerezes-refaktoralas)
14. [Játék logika - Ellenségek](#14jatek-logika---ellensegek)

Az út hosszú, de tanulságos. A forráskódot folyamatosan javítjuk és szépítjük, hogy a végén egy jól áttekinthető kódunk legyen.

1. A projekt alapjai
--------------------

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
