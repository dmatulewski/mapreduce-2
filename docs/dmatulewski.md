<h1> Map-Reduce <h1>

Baza została pobrana w formacie CSV i została oczyszczona za pomocą google refine. Baze danych pobralem ze strony: http://openstates.org/downloads/ dla miasta NY w USA.
<br/>

<h2> MongoDB - import danych </h2>

Sprawdzenie liczby rekordów:

```sh
C:\mongodb\bin>mongo
MongoDB shell version: 2.4.7
connecting to: test
> use votes
switched to db votes
> db.vote.count()
886182
```

Przykładowy rekord:

```sh
> db.vote.findOne()
{
        "_id" : ObjectId("52b349e1093c8062d690c84d")
        "vote_id" : "NYV00004655",
        "leg_id" : "NYL000025",
        "name" : "Johnson",
        "vote" : "yes"
}
```

<h2>Pierwszy MapReduce</h2>
5 osób które oddało najwięcej pozytywnych głosów.


Funkcja dotycząca imienia i oddanego głosu.
```sh
var mapFunction = function() {
    emit(this.name, this.vote);
};
```

Funkcja zliczająca ilość wystąpień słowa "yes".
```sh
var reduceFunction = function(key, values) {
    var yes = 0;
    for(i in values) {
        if(values[i] === "yes") {
            yes++;
        }
    }
    return yes;
};
```

MapReduce:
```sh
var result = db.vote.mapReduce(mapFunction, reduceFunction, {out: {inline: 1}});
```


5 osób które oddały najwięcej pozytywnych głosów:
```sh
> db.map_reduce_example.find().limit(5).sort({value: -1})
{ "_id" : "Duprey", "value" : 2877 }
{ "_id" : "Meng", "value" : 1222 }
{ "_id" : "Fahy", "value" : 1074 }
{ "_id" : "Santaba", "value" : 1046 }
{ "_id" : "DiPietr", "value" : 762 }
```


![wykres1](../images/dmatulewski/diagram2.png)



<h2>Drugi MapReduce</h2>
5 Okręgów w których było najwięcej posłów:

Funckja dotycząca okręgu i imienia.

```sh
var mapFunction1 = function() 
        { emit(this.leg_id,this.name);
};
```

Funkcja zliczająca posłów w danym okręgu:

```sh
> var reduceFunction1 = function(key,values) 
        { 
        var ilosc = 0; for(i in values){ 
        ilosc++; 
        } 
        return ilosc; };
};

```

MapReduce2:

```sh
> var result = db.vote.mapReduce( mapFunction1, reduceFunction1, {out : "ilosc"} );

```

Ilość posłów w danym okręgu:

```sh
db.ilosc.find().sort({value:-1}).limit(5)


{ "_id" : "NYL000224", "value" : 56 }
{ "_id" : "NYL000029", "value" : 39 }
{ "_id" : "NYL000003", "value" : 37 }
{ "_id" : "NYL000050", "value" : 37 }
{ "_id" : "NYL000012", "value" : 36 }


```

![wykres2](../images/dmatulewski/diagram1.png)

