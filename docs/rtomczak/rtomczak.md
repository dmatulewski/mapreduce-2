# Lista lotnisk na swiecie - Mapreduce z [tych danych](http://openflights.org/data.html)
___

### Robert Tomczak

#### MongoDB version

```bash
MongoDB version: 2.5.3
```

Po sciagnieciu pliku .pac zmieniamy na rozszerzenie csv i używamy na nim [skrypt](../../scripts/rtomczak/zmiana.py) w pythonie

Następnie plik ```lotniska.csv``` jest gotowy do importu

```bash
mongoimport -d airports -c airports --type csv --file lotniska.csv
```

Baza ta zawiera 7663 wpisow dotyczacych lotnisk na swiecie

Przykladowy wpis :

```json
{
        "_id" : ObjectId("52dbfee89a16965ee24b73b1"),
        "Name" : "Goroka",
        "City" : "Goroka",
        "Country" : "Papua New Guinea",
        "IATA/FAA" : "GKA",
        "ICAO" : "AYGA",
        "Latitude" : -6.081689,
        "Longitude" : 145.391881,
        "Altitude" : 5282,
        "Timezone" : 10,
        "DST" : "U"
}
```

### Map Reduce 1 - ilosc lotnisk w danej strefie czasowej

Funkcja mapujaca:

```js
var map1 = function() {
    emit(this.Timezone, 1);
};
```

Funkcja redukujaca:

```js
var reduce1 = function(key,val) {
    var count = 0;
    for(i = 0; i < val.length; i++) {
        count += val[i];
    }
    return count;
}
```

Funkcja mapReduce :

```js
var result1 = db.airports.mapReduce(
    map1,
    reduce1,
    { out : "tmz"}
);
```

Wynik wywolania:

```json
> db.tmz.find()
{ "_id" : -12, "value" : 2 }
{ "_id" : -11, "value" : 12 }
{ "_id" : -10, "value" : 79 }
{ "_id" : -9.5, "value" : 3 }
{ "_id" : -9, "value" : 233 }
{ "_id" : -8, "value" : 260 }
{ "_id" : -7, "value" : 263 }
{ "_id" : -6, "value" : 551 }
{ "_id" : -5, "value" : 905 }
{ "_id" : -4.5, "value" : 1 }
{ "_id" : -4, "value" : 401 }
{ "_id" : -3.5, "value" : 1 }
{ "_id" : -3, "value" : 323 }
{ "_id" : -2, "value" : 19 }
{ "_id" : -1, "value" : 21 }
{ "_id" : 0, "value" : 402 }
{ "_id" : 1, "value" : 1339 }
{ "_id" : 2, "value" : 533 }
{ "_id" : 3, "value" : 281 }
{ "_id" : 3.5, "value" : 23 }
...
```

Wizualizacja danych pod linkiem : [Wykres](http://roberttomczak.github.io/charts/mr1.html)
___
### Map Reduce 2 - ilosc lotnisk nalezacych do danego typu zmiany czasu 

Typy zmiany czasu :

* E dla Europy
* A dla USA i Kanady
* S dla Poludniowej Ameryki
* O dla Australii
* Z dla Nowej Zelandii
* N dla Braku Daylight Saving Time
* U dla Braku Danych

Dla lepszego wyjasnienia czym roznia sie dane typy info pod [linkiem](http://openflights.org/help/time.html) w dziale Daylight Savings Time (DST)

Funkcja mapujaca:

```js
var map2 = function() { 
    emit(this.DST, 1); 
};
```

Funkcja redukujaca:

```js
var reduce2 = function(key,val) {
    var count = 0;
    for(i = 0; i < val.length; i++) {
        count += val[i];
    }
    return count;
}
```

Funkcja mapReduce :

```js
var result2 = db.airports.mapReduce( 
    map2, 
    reduce2, 
    { out : "dst" } 
);
```

Wynik wywolania:

```js
> db.dst.find()
{ "_id" : "A", "value" : 1857 }
{ "_id" : "E", "value" : 1759 }
{ "_id" : "N", "value" : 1257 }
{ "_id" : "O", "value" : 211 }
{ "_id" : "S", "value" : 388 }
{ "_id" : "U", "value" : 2135 }
{ "_id" : "Z", "value" : 52 }
```

Wizualizacja danych pod linkiem : [Wykres](http://roberttomczak.github.io/charts/mr2.html)