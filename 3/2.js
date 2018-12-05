// Goal: in a 1000x1000 grid, figure out how many points from overlapping rectangles result.
// 1000x1000 = 1,000,000 points
// Part 2: Find the *one* claim in data.txt that has zero overlaps.

const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

const fabricMap = generateEmpty2DArray(1000);
const claimsArray = [];

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
    claimsArray.push(input);
  })
  .on('close', function() {
    // For Part 2, we'll instead read through each claim without making changes
    // and find the one whose rectangle is composed entirely of '1's
    console.log(fabricMap);
    const goodClaim = findTheOneGoodClaim(fabricMap, claimsArray);
    console.log(`The one good claim is ID #${goodClaim}`);
  });

function updateMap(claim) {
  const { id, xCoord, yCoord, width, height } = processClaim(claim);

  for (let y = yCoord; y < yCoord + height; y++) {
    for (let x = xCoord; x < xCoord + width; x++) {
      fabricMap[y][x] += 1;
    }
  }
}

function processClaim(claim) {
  const regex = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/;

  return {
    id: Number(claim.match(regex)[1]),
    xCoord: Number(claim.match(regex)[2]),
    yCoord: Number(claim.match(regex)[3]),
    width: Number(claim.match(regex)[4]),
    height: Number(claim.match(regex)[5]),
  };
}

function findTheOneGoodClaim(map, claims) {
  let match = 0;

  for (let i = 0; i < claims.length; i++) {
    const { id, xCoord, yCoord, width, height } = processClaim(claims[i]);

    let invalid = false;

    for (let y = yCoord; y < yCoord + height; y++) {
      for (let x = xCoord; x < xCoord + width; x++) {
        if (map[y][x] >= 2) {
          invalid = true;
          break;
        }
      }
      if (invalid) break;
    }

    if (!invalid) {
      console.log(`Match is ${id}`);
      return match;
    }
  }

  return null;
}
