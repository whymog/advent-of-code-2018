const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

function init() {
  let polymers = '';

  lineReader
    .on('line', function(input) {
      polymers += input;
    })
    .on('close', function() {
      // Run the reduce function
      const reducedPolymers = reducePolymers(polymers);
      console.log(`The length of the reduce polymer string is: ${reducedPolymers.length}`);
    });
}

function reducePolymers(str) {
  // If two adjacent letters of different cases are found, remove them
  // Repeat this until the above is no longer true, then return string

  let pairFound = false;

  while(true) {
    let pairFound = false;
    for (let i = 0; i < str.length - 1; i++) {
      if (isPolymerPair(str[i], str[i + 1])) {
        pairFound = true;
        str = removePair(str, i);
        break;
      }
    }
    if (!pairFound) break;
  }

  return str;
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
