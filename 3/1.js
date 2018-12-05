// Goal: in a 1000x1000 grid, figure out how many points from overlapping rectangles result.
// 1000x1000 = 1,000,000 points

const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

// I think what I'll do is just create a 2D array where every value is initalized
// at zero, and then I'll just procedurally increment each coordinate by 1 for
// each rectangle that contains it. Finally, I'll read through the array and figure
// out how many coordinates have a value > 2.

const fabricMap = generateEmpty2DArray(1000);

function generateEmpty2DArray(len) {
  const new2DMap = [];

  for (let i = 0; i < len; i++) {
    const newLine = [];
    for (let j = 0; j < len; j++) {
      newLine.push(0);
    }
    new2DMap.push(newLine);
  }

  return new2DMap;
}

lineReader
  .on('line', function(input) {
    updateMap(input);
  })
  .on('close', function() {
    const duplicateCount = findDuplicates(fabricMap);
  });

function updateMap(rect) {
  // First, clean up the row data so it just gets us what we need.
  // Probably use a regex.
  const regex = /#\d+ @ (\d+),(\d+): (\d+)x(\d+)/;
  const xCoord = Number(rect.match(regex)[1]);
  const yCoord = Number(rect.match(regex)[2]);
  const width = Number(rect.match(regex)[3]);
  const height = Number(rect.match(regex)[4]);

  // Next, let's set up our nested for loops. We'll want to start the outer loop
  // at fabricMap[yCoord] and the inner loop at fabricMap[yCoord][xCoord].
  // From there, we'll want to constrain the outer (y) loop to yCoord + height
  // and the inner (x) loop to xCoord + width.
  for (let y = yCoord; y < yCoord + height; y++) {
    for (let x = xCoord; x < xCoord + width; x++) {
      fabricMap[y][x] += 1;
    }
  }
}

function findDuplicates(map) {
  let counter = 0;

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] >= 2) counter++;
    }
  }

  return counter;
}
