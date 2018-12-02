const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

let value = 0;

lineReader.on('line', function(input) {
  const operation = input.charAt(0) === '+' ? 'add' : 'subtract';
  switch (operation) {
    case 'add':
      value += Number(input.slice(1));
      console.log(`value plus ${input.slice(1)} is ${value}`);
      break;
    case 'subtract':
      value -= Number(input.slice(1));
      console.log(`value minus ${input.slice(1)} is ${value}`);
      break;
    default:
      console.error('Invalid operand');
  }
});
