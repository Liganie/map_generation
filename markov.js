// basic usage: new Markov(lotsOfText).generate()

// markov chain constructor
//
// @string input {example text}
// @integer len {optional # of words to output}
// @integer stateSize {optional chain order}


// prior and order
// min and max size
// potential additionnal names
// table for feeding
// output size of  by default
// analyse on the begining
// first letter by random from codebook
// out of the loop probability from the codebook


function normalizeLookup(lookup){
  var count; // use to count the total occurences and normalize bottom layer content

  for (var l1 in lookup) {
    count = 0;
    for(var l2 in lookup[l1]) { // count the number of occurences at bottom layer
      count += lookup[l1][l2];
    }
    for(var l2 in lookup[l1]) { // normalize bottom layer
      lookup[l1][l2] /= count;
    }
  } 
  return lookup;
}

function getMarkovLookup(input, order, prior){
  var start = '0'.repeat(order);
  var words = input.split(/\s/);
  var lookup = {}; // 0 is used to indicate the start or end of the word
  lookup[start] = {};
  lookup["alphabet"] = {};
  var word;// the word indexed
  var key; // set of characters to put in the lookup table
  var letter; // Letter after the key

  // initialize the lookup table
  for (var w in words) {
    word = start+words[w]+'0'; // this way starting letter will be associated to the start string of 0s and finish by 0
    for (var l = 0; l < word.length-order; l++) {
      key = word.slice(l, l+order);
      letter = word[l+order];
      if (!(key in lookup)) {lookup[key] = {};} // if this is a new letter, add it
      if (!(letter in lookup[key])) {lookup[key][letter] = 0;} // if this is a new letter, initialize the counter
      if (!(letter in lookup["alphabet"])) {lookup["alphabet"][letter] = 1;} // the alphabet is used to show all the letters encountered
      lookup[key][letter]++;
    }
  } 
  lookup = normalizeLookup(lookup);// normalize the tables

  return lookup;
}

function Markov(input, order, prior) {
  this.cache = Object.create(null);
  this.order = order || 2;
  this.prior = prior || 0;
  this.lookup = getMarkovLookup(input, this.order, this.prior);
}

// return a random element from an array
Markov.prototype.nextLetter = function(key){
  var next;
  var value = Math.random() / (1 - this.prior);
  if (key in this.lookup) {
    for (next in this.lookup[key]) {
      value -= this.lookup[key][next];
      if (value<0) {return next;}
    }
  }
  // being here means that we are using the prior
  return this.nextLetter("alphabet"); 
}

// generate new text from a markov lookup
Markov.prototype.generate = function(number, minLetter, maxLetter){
  number = number || 1;
  minLetter = minLetter || 5;
  maxLetter = maxLetter || 11;

  var words = [];
  var word;
  while (words.length < number) {
    word = '0'.repeat(this.order);
    word += this.nextLetter(word.slice(word.length-this.order, word.length));
    while (word[word.length-1] != 0) {
      word += this.nextLetter(word.slice(word.length-this.order, word.length));
    }
    word = word.slice(this.order, word.length-1);
    if (word.length >= minLetter && word.length <= maxLetter) {words.push(word);}
  }
  return words.join(' ');
}