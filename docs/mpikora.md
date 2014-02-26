### Mateusz Pikora

Zadanie wykonałem korzystając z pliku word_list.txt, który był zawarty w poleceniu zadania.

## MapReduce - MongoDB

Utworzyłem z pliku word_list.txt plik z JSONami zawierającymi słowo oraz składające się na nie litery w kolejności alfabetycznej przy pomocy skryptu:

```Perl
#!/bin/env perl
open (INFILE, '<word_list.txt');
open (OUTFILE, '>word_list2.json');

while (<INFILE>) {
	chomp($_);
	@letters = split(undef,$_);
	@sorted = sort @letters;
	$word = join('',@sorted);
	print OUTFILE "{ \"word\": \"$_\", \"letters\": \"$word\" }\n";
}

close (INFILE); 
close (OUTFILE); 
```

Dane zaimportowałem do bazy poleceniem:

```
~/mongodb-linux/bin/mongoimport --collection words --file word_list2.json
```

Wyniki otrzymałem za pomocą MapReduce w następujący sposób:

```js
var mapFunction = function() {
	emit(this.letters, { words: [this.word]});
};

var reduceFunction = function(key, values) {
	var result = {
		words: [] 
	};
	values.forEach(function(V){
		result.words = V.words.concat(result.words);
	});
	return result;
};

db.words.mapReduce(
	mapFunction,
	reduceFunction,
	{ out: "anagrams" }
)
```

Zdecydowana większość słów nie ma anagramów na tej liście. Poniżej zamieszczam kilkanaście rekordów z kolekcji z wynikami. Cała kolekcja wynikowa zawiera 7011 dokumentów:

```JSON
{ "_id" : "acdefh", "value" : { "words" : [  "chafed" ] } }
{ "_id" : "acdefs", "value" : { "words" : [  "decafs" ] } }
{ "_id" : "acdegr", "value" : { "words" : [  "cadger",  "graced" ] } }
{ "_id" : "acdegs", "value" : { "words" : [  "cadges" ] } }
{ "_id" : "acdehk", "value" : { "words" : [  "hacked" ] } }
{ "_id" : "acdehr", "value" : { "words" : [  "arched" ] } }
{ "_id" : "acdehs", "value" : { "words" : [  "cashed",  "chased" ] } }
{ "_id" : "acdeht", "value" : { "words" : [  "detach" ] } }
{ "_id" : "acdeir", "value" : { "words" : [  "cardie" ] } }
{ "_id" : "acdeiv", "value" : { "words" : [  "advice" ] } }
{ "_id" : "acdejk", "value" : { "words" : [  "jacked" ] } }
{ "_id" : "acdekl", "value" : { "words" : [  "lacked",  "calked" ] } }
{ "_id" : "acdekp", "value" : { "words" : [  "packed" ] } }
{ "_id" : "acdekr", "value" : { "words" : [  "racked" ] } }
```

##Faceted search - CouchDB

Utworzyłem odpowiednie JSONy skryptem bardzo podobnym do poprzedniego:

```Perl
#!/bin/env perl
open (INFILE, '<word_list.txt');
open (OUTFILE, '>word_list3.json');

while (<INFILE>) {
	chomp($_);
	@letters = split(undef,$_);
	@sorted = sort @letters;
	$word = join('',@sorted);
	print OUTFILE "{ \"index\": { \"_type\": \"lec\" } }\n";
	print OUTFILE "{ \"word\": \"$_\", \"letters\": \"$word\" }\n";
}

close (INFILE); 
close (OUTFILE); 
```

Zaimportowałem dane z pliku do bazy poleceniem:

```
curl -s -XPOST localhost:9200/words/_bulk --data-binary @word_list3.json ; echo
```

Dla każdego zbioru liter zawartego w bazie udało mi się otrzymać tylko ilość słów, które są w bazie i składają się z takich samych liter. Zrobiłem to następującym Faceted Search:

```JSON
{
  "query": {
    "match_all": {}
  },
  "facets": {
    "format": {
      "terms": {
        "field": "letters",
      }
    }
  }
}
```

Fragment wyniku zwróconego przez powyższe Faceted Search:

```JSON
{
    term: acerst
    count: 6
}
{
    term: belstu
    count: 5
}
{
    term: adeprs
    count: 5
}
{
    term: aceprs
    count: 5
}
{
    term: inopst
    count: 4
}
{
    term: elrstu
    count: 4
}
{
    term: eimrst
    count: 4
}
{
    term: eersst
    count: 4
}
{
    term: berstu
    count: 4
}
{
    term: aelsst
    count: 4
}
{
    term: aelrst
    count: 4
}
{
    term: aelpst
    count: 4
}
```
