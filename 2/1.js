const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

const sourceArray = [];
const repeats = {
  two: 0,
  three: 0,
};

lineReader
  .on('line', function(input) {
    sourceArray.push(input);
  })
  .on('close', findRepeats);

function findRepeats() {
  let doubles = 0;
  let triples = 0;

  sourceArray.forEach(line => {
    const sortedLetters = line.split('').sort();
    let doubleFound = '';
    let tripleFound = '';

    for (let i = 0; i < sortedLetters.length; i++) {
      if (sortedLetters[i] === sortedLetters[i + 1]) {
        if (sortedLetters[i] === sortedLetters[i + 2]) {
          if (sortedLetters[i] === sortedLetters[i + 3]) {
            // 4+ is not valid!
            i += 3;
          } else {
            tripleFound = tripleFound ? tripleFound : sortedLetters[i];
            i += 2;
          }
        } else {
          doubleFound = doubleFound ? doubleFound : sortedLetters[i];
          i += 1;
        }
      }
    }

    if (doubleFound) doubles++;
    if (tripleFound) triples++;
  });

  console.log(calculateChecksum(doubles, triples));
}

function calculateChecksum(doubles, triples) {
  return doubles * triples;
}
