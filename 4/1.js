const fs = require('fs');
const readline = require('readline');

const file = fs.createReadStream('data.txt');

const lineReader = readline.createInterface({
  input: file,
});

const log = [];
const guardActivityLog = {};

const logParserRegex = /\[\d\d\d\d-(\d\d)-(\d\d)\s(\d\d):(\d\d)]\s(.+)/;
const guardIdentifierRegex = /Guard\s#(\d+)\s.+/;

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
        (a, b) => (a.date != b.date ? a.date - b.date : a.time - b.time),
      );

      updateGuardActivityLog();

      findSleepiestGuard();
    });
}

function buildLog(entry) {
  const [match, month, day, hours, minutes, event] = entry.match(
    logParserRegex,
  );

  // Also determine the event type
  let eventType = '';
  let guardId = null;

  if (event.match('begins shift')) {
    eventType = 'begin';
    guardId = event.match(guardIdentifierRegex)[1];
  } else if (event.match('falls asleep')) {
    eventType = 'sleep';
  } else if (event.match('wakes up')) {
    eventType = 'wake';
  } else throw new Error('Event type not accounted for. Whoops.');

  log.push({
    date: Number(`${month}${day}`),
    time: Number(`${hours}${minutes}`),
    event: eventType,
    guard: guardId,
  });
}

function updateGuardActivityLog() {
  // First, let's generate a new guard activity log.

  // Next, we'll go ahead and update the values for each of those objects we
  // created for each guard.
  let currentGuardId = null;
  // Read through each entry in succession and update the minutes they were
  // asleep.
  for (let i = 0; i < log.length; i++) {
    if (!guardActivityLog[currentGuardId] && currentGuardId !== null) {
      guardActivityLog[currentGuardId] = { totalTimeAsleep: 0 };
    }

    if (log[i].event === 'begin') {
      currentGuardId = log[i].guard;
    } else if (log[i].event === 'sleep') {
      // Check the next entry to see wake time
      // Sleep is start-time inclusive, end-time exclusive
      const sleepStart = log[i].time;
      const sleepEnd = log[i + 1].time;
      for (let j = sleepStart; j < sleepEnd; j++) {
        guardActivityLog[currentGuardId][j]
          ? guardActivityLog[currentGuardId][j]++
          : (guardActivityLog[currentGuardId][j] = 1);
      }

      // Finally, we'll save some time by increasing their total time asleep
      guardActivityLog[currentGuardId].totalTimeAsleep += sleepEnd - sleepStart;

      i++;
    }
  }
}

function findSleepiestGuard() {
  const guards = Object.keys(guardActivityLog);
  console.log(guards);

  let sleepiestGuard = null;
  let minutesAsleep = null;

  guards.forEach(guard => {
    if (guardActivityLog[guard].totalTimeAsleep > minutesAsleep) {
      sleepiestGuard = guard;
      minutesAsleep = guardActivityLog[guard].totalTimeAsleep;
    }
  });

  console.log(
    `The sleepiest guard is ${sleepiestGuard}, with ${minutesAsleep} minutes asleep on the job.`,
  );

  // Now find the mode minute the guard was asleep
  let mode = 0;
  let modeMinute = null;
  const minutes = Object.keys(guardActivityLog[sleepiestGuard]);

  minutes.forEach(minute => {
    if (minute !== 'totalTimeAsleep') {
      if (modeMinute === null) modeMinute = minute;
      console.log(`${minute}: ${guardActivityLog[sleepiestGuard][minute]}`);
      if (guardActivityLog[sleepiestGuard][minute] > mode) {
        modeMinute = minute;
        mode = guardActivityLog[sleepiestGuard][minute];
      }
    }
  });

  console.log(
    `The sleepiest guard, #${sleepiestGuard}, was most often asleep on minute ${modeMinute} — a total of ${mode} times.`,
  );

  console.log(
    `The answer to 4-1 is guardId * modeMinute, which is ${sleepiestGuard *
      modeMinute}`,
  );
}

init();
