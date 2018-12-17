const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

const log = [];
const guardActivityLog = {};

const logParserRegex = /\[\d\d\d\d-(\d\d)-(\d\d)\s\d\d:(\d\d)]\s(.+)/;
const guardIdentifierRegex = /Guard\s#(\d+)\s.+/;
let currentGuardId = null;

// 1. Read all the data into a new array
// Be sure to strip out only the data needed.
// We'll convert the strings into objects accordingly.
function init() {
  lineReader
    .on('line', function(input) {
      buildLog(input);
    })
    .on('close', function() {
      // Sort by date and then by minute if necessary
      log.sort(
        (a, b) => (a.date != b.date ? a.date - b.date : a.minute - b.minute),
      );
    });
}

function buildLog(entry) {
  const [match, month, day, minute, event] = entry.match(logParserRegex);

  // Also determine the event type
  let eventType = '';

  if (event.match('begins shift')) eventType = 'begin';
  else if (event.match('falls asleep')) eventType = 'sleep';
  else if (event.match('wakes up')) eventType = 'wake';
  else throw new Error('Event type not accounted for. Whoops.');

  log.push({
    date: Number(`${month}${day}`),
    minute: Number(minute),
    event: eventType,
  });

  console.log(log);
}

// 2. Sort the data in my new array into chronological order

/*
Example data:
    [1518-11-01 00:00] Guard #10 begins shift
    [1518-11-01 00:05] falls asleep // NOTE: this minute counts as "asleep"
    [1518-11-01 00:25] wakes up // NOTE: wake-up minutes count as "awake"

All I need are the date (mm-dd), the guard ID, and the minutes of each event
(mm). I need to sort them into chronological order to ensure that each event
corresponds to the correct guard ID, since the ID is only given on the "begins
shift" events. So I could build a new array of objects with this shape:

[
  {
    date: {
      month: "11",
      day: "01",
    },
    guardId: 10,
    eventType: "begin | sleep | awake"
  }
]

Actually, since all the data seems to follow the pattern of
"start -> sleep -> wake", maybe it'd be easier to just create a smaller array:

[
  {
    date: "11-01",
    guardId: 10,
    fellAsleep: 5,
    wokeUp: 25
  } // ...
]

This would effectively shrink the number of items from the source data by a
factor of 3.

3. Once my new array is sorted, I can create a new data structure determining
the sum total of minutes each guard is asleep across all nights. Something like:

{
  guard1: 678,
  guard2: 383,
  // ...
}

4. Now that I've determined the guard with the most minutes asleep, I can go
back to my original array and get the *mode minute* that they're most frequently
asleep during. Something like:

for (let i = 0; i < array.length; i++) {
  if (array[i].guardId === modeGuard) {
    startMinute = array[i].minute;

  }
})

*/

init();
