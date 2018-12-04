const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

let currentValue = 0;

const dataSet = [];
const results = [currentValue];

var duplicateFound = false;

lineReader
  .on('line', function(input) {
    dataSet.push(Number(input));
  })
  .on('close', loopUntilDuplicateFound);

function loopUntilDuplicateFound() {
  var loopCount = 0;
  while (loopCount < 1000) {
    console.log(`Loop ${loopCount}`);
    for (let i = 0; i < dataSet.length; i++) {
      if (duplicateFound) return;
      currentValue += Number(dataSet[i]);
      results.push(currentValue);
      // console.log(currentValue);
      for (let j = 0; j < results.length - 1; j++) {
        if (currentValue === results[j]) {
          console.log(`Match found! It's ${results[j]}.`);
          duplicateFound = true;
          return;
        }
      }
      // console.log('No matches found this time.');
    }
    loopCount++;
  }
}

// function checkForDuplicates() {
//   // console.log(results);
//   for (let i = 0; i < results.length - 1; i++) {
//     if (currentValue == results[i]) {
//       console.log(`Duplicate value found! It's ${currentValue}`);
//       duplicateFound = true;
//     }
//   }
// }
