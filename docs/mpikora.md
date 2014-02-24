### Mateusz Pikora

Zadanie wykonałem korzystając z pliku word_list.txt zawartego w poleceniu zadania.

## MapReduce - MongoDB

Utworzyłem z pliku word_list.txt plik z JSONami zawierającymi słowo oraz składające się na nie litery w kolejności alfabetycznej przy pomocy skryptu:

```
#!/usr/local/bin/perl
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

Dane zaimortowałem do bazy poleceniem:

```
~/mongodb-linux/bin/mongoimport --collection words --file word_list2.json
```

Wyniki otrzymałem za pomocą MapReduce w następujący sposób:

```JSON
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

##Faceted search - CouchDB

Utworzyłem odpowiednie JSONy skryptem bardzo podobnym do poprzedniego:

```
#!/usr/local/bin/perl
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

Dla każdego zbioru liter zawartego w bazie udało mi się otrzymać tylko ilośc słów, które są w bazie i składają się z takich samych liter. Zrobiłem to następującym faceted search:

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
