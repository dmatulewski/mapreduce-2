#*Piotr Kotłowski*

##***Zadanie 3***

## Skorzystałem z list lotnisk na świecie http://openflights.org/data.html. Zawierają one takie dane jak: nazwa, miasto, państwo, położenie geograficzne.
Przykładowy rekord:
```json
{ "_id" : ObjectId("52fd61f01b6c883c74def6fc"), 
"id" : 7, 
"name" : "Narsarsuaq", 
"city" : "Narssarssuaq", 
"country" : "Greenland", 
"IATA" : "UAK", 
"ICAO" : "BGBW", 
"latitude" : 61.160517, 
"longitude" : -45.425978, 
"altitude" : 112, 
"timezone" : -3, 
"DST" : "E" }

```



Import do mongodb:
```bash
time mongoimport -d dataa -c dataa --type csv --headerline ~/Pobrane/airports-utf8.csv

```


### Ilość lotnisk w danym kraju:

MAP:

```js
var map = function() {
    emit(
        {kraj: this.country}, {count: 1}
    );
};
```

REDUCE:

```js
var reduce = function(key, vals) {
    var count = 0;
    vals.forEach(function (c) {
        count += c['count'];
    });
    return {count: count};
};
```

MAP+REDUCE:

```js
db.dataa.mapReduce(map, reduce, {out: 'lotniska'});
```
Wywołanie: (10 państw z największą liczbą lotnisk)
```bash
db.lotniska.find().limit(10).sort({count:-1})

```
Wynik wywolania:
```json
{ "_id" : { "kraj" : "United States" }, "value" : { "count" : 1566 } }
{ "_id" : { "kraj" : "Canada" }, "value" : { "count" : 405 } }
{ "_id" : { "kraj" : "Germany" }, "value" : { "count" : 316 } }
{ "_id" : { "kraj" : "Australia" }, "value" : { "count" : 258 } }
{ "_id" : { "kraj" : "France" }, "value" : { "count" : 226 } }
{ "_id" : { "kraj" : "Russia" }, "value" : { "count" : 223 } }
{ "_id" : { "kraj" : "Brazil" }, "value" : { "count" : 212 } }
{ "_id" : { "kraj" : "China" }, "value" : { "count" : 210 } }
{ "_id" : { "kraj" : "United Kingdom" }, "value" : { "count" : 196 } }
{ "_id" : { "kraj" : "India" }, "value" : { "count" : 137 } }
```

