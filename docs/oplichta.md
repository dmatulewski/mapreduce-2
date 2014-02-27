#*Oskar Plichta*

##***Zadanie 3***

##Dane
[GetGlue and Timestamped Event Data](http://getglue-data.s3.amazonaws.com/getglue_sample.tar.gz) (ok. `11 GB`, `19 831 300` json-ów, próbka 100 jsonów [getglue101](https://github.com/nosql/aggregations-2/blob/master/data/wbzyl/getglue101.json)). Są to dane z [IMDB](http://www.imdb.com/) z lat 2007–2012, tylko filmy i przedstawienia TV. 

Przykładowy dokument `json`:

```json
{
	"_id" : ObjectId("52b81289d4f850c63820fee5"),
	"comment" : "",
	"hideVisits" : "false",
	"modelName" : "tv_shows",
	"displayName" : "",
	"title" : "Criminal Minds",
	"timestamp" : "2008-08-01T06:58:14Z",
	"image" : "http://cdn-1.nflximg.com/us/boxshots/large/70056671.jpg",
	"userId" : "areilly",
	"private" : "false",
	"source" : "http://www.netflix.com/Movie/Criminal_Minds_Season_1/70056671",
	"version" : "2",
	"link" : "http://www.netflix.com/Movie/Criminal_Minds_Season_1/70056671",
	"lastModified" : "2011-12-16T19:41:19Z",
	"action" : "Liked",
	"lctitle" : "criminal minds",
	"objectKey" : "tv_shows/criminal_minds",
	"visitCount" : "1"
}
```

##Import

Import został przeprowadzony do wcześniejszego zadania. Ponownie użyłem tej samej bazy danych.

###Sprawdzenie
```js
MongoDB shell version: 2.4.9
connecting to: test
> show dbs
imdb	17.9453125GB
local	0.078125GB
> use imdb
switched to db imdb
> db.imdb.count()
19831300
> 
```


##MongoDB - MapReduce

###Opis

Jakie są ilości konkretnych typów programów?


####Kod funkcji Map oraz Reduce

var m = function() {
  emit(this.modelName, 1);
};


var r = function(key, val) {
  var count = 0;
  for(i = 0; i < val.length; i++) {
    count += val[i];
  }
  return count;
};

####Wykonanie
var result= db.imdb.mapReduce(m,r, { out : "typProg" }
);

####Wynik
```json
{
	"result" : "typProg",
	"timeMillis" : 657383,
	"counts" : {
		"input" : 19831300,
		"emit" : 19831300,
		"reduce" : 3236927,
		"output" : 54850
	},
	"ok" : 1,
}
```

```sh
Thu Feb 27 19:54:09.009 [conn1] 		M/R: (1/3) Emit Progress: 19658100/19831300	99%
Thu Feb 27 19:54:12.063 [conn1] 		M/R: (1/3) Emit Progress: 19753500/19831300	99%
Thu Feb 27 19:54:17.002 [conn1] 		M/R: (3/3) Final Reduce Progress: 476900/3209749	14%
Thu Feb 27 19:54:20.002 [conn1] 		M/R: (3/3) Final Reduce Progress: 1213400/3209749	37%
Thu Feb 27 19:54:23.009 [conn1] 		M/R: (3/3) Final Reduce Progress: 1978600/3209749	61%
Thu Feb 27 19:54:26.002 [conn1] 		M/R: (3/3) Final Reduce Progress: 2830100/3209749	88%
```


```js
> db.typProg.find();
{ "_id" : null, "value" : 56 }
{ "_id" : "movies", "value" : 7572855 }
{ "_id" : "recording_artists", "value" : 11 }
{ "_id" : "topics", "value" : 23 }
{ "_id" : "tv_shows", "value" : 12258355 }
```
###MapReduce 2

###Opis

Jakie tytuły są najpopularniejsze?

####Kod funkcji Map oraz Reduce

var m = function() {
  emit(this.title.toLowerCase(), 1);
};


var r = function(key, val) {
  var count = 0;
  for(i = 0; i < val.length; i++) {
    count += val[i];
  }
  return count;
};

####Wykonanie
var result= db.imdb.mapReduce(m,r, { out : "tytuly" }
);

####Wynik
10 najpopularniejszych tytułów

```js
> db.tytuly.find().sort({value: -1}).limit(10);
{ "_id" : "the big bang theory", "value" : 260686 }
{ "_id" : "fringe", "value" : 187975 }
{ "_id" : "nikita", "value" : 150683 }
{ "_id" : "glee", "value" : 146943 }
{ "_id" : "supernatural", "value" : 130454 }
{ "_id" : "true blood", "value" : 123197 }
{ "_id" : "the walking dead", "value" : 119502 }
{ "_id" : "the vampire diaries", "value" : 118001 }
{ "_id" : "game of thrones", "value" : 108548 }
{ "_id" : "once upon a time", "value" : 99551 }

```