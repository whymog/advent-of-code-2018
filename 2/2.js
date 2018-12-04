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
  .on('close', findMatch);

function findMatch() {
  console.log(`There are ${sourceArray.length} lines in sourceArray`);

  for (let i = 0; i < sourceArray.length; i++) {
    for (let j = i + 1; j < sourceArray.length; j++) {
      let answer = '';
      let strikes = 0;

      for (let k = 0; k < sourceArray[i].length; k++) {
        if (sourceArray[i][k] === sourceArray[j][k] && strikes < 2) {
          answer += sourceArray[i][k];
          console.log(answer);
        } else {
          strikes++;
        }
      }

      console.log(answer, answer.length);

      if (answer.length >= sourceArray[i].length - 1) {
        console.log('THE ANSWER IS ' + answer);
        return;
      }
    }
  }
}
