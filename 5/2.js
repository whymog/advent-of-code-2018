const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

function init() {
  let polymers = '';
  const reducedPolymersByLetter = {};

  for (let i = 65; i <= 90; i ++) {
    const letter = String.fromCharCode(i);
    reducedPolymersByLetter[letter] = '';
  }

  lineReader
    .on('line', function(input) {
      polymers += input;
    })
    .on('close', function() {
      // Run the reduce function for each letter of the alphabet
      const letters = Object.keys(reducedPolymersByLetter);

      // Note: this is SLOW as HECK on my 2012 MacBook Air. Poor CPU's doing
      // what it can...
      letters.forEach(letter => {
        reducedPolymersByLetter[letter] = reducePolymers(polymers, letter).length;
      });

      // Then iterate through reducedPolymersByLetter to find the shortest string
      let shortestString = null;

      letters.forEach(letter => {
        if (shortestString === null) {
          shortestString = reducedPolymersByLetter[letter];
        }
        if (shortestString === null || shortestString > reducedPolymersByLetter[letter]) {
          shortestString = reducedPolymersByLetter[letter];
        }
      });

      console.log(`The shortest polymer string length is ${shortestString}`);
    });
}

function reducePolymers(str, ltr) {
  // First, remove any matches of the given letter in either case
  let newStr = '';

  for (let i = 0; i < str.length; i++) {
    if (str[i] !== ltr.toUpperCase() && str[i] !== ltr.toLowerCase()) {
      newStr += str[i];
    }
  }

  // Now do the same thing as in exercise 1:
  // If two adjacent letters of different cases are found, remove them
  // Repeat this until the above is no longer true, then return string
  let pairFound = false;

  while(true) {
    let pairFound = false;
    for (let i = 0; i < newStr.length - 1; i++) {
      if (isPolymerPair(newStr[i], newStr[i + 1])) {
        pairFound = true;
        newStr = removePair(newStr, i);
        break;
      }
    }
    if (!pairFound) break;
  }

  return newStr;
}

function isPolymerPair(a, b) {
  // A pair is two adjacent values of the same letter with different
  // capitalizations. e.g., bB or Yy
  return a.toUpperCase() === b.toUpperCase() &&
    ((a === a.toUpperCase() && b === b.toLowerCase()) ||
    (a === a.toLowerCase() && b === b.toUpperCase()));
}

function removePair(str, index) {
  return str.slice(0,index) + str.slice(index + 2);
}

init();
