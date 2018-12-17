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

      findModeMinuteGuard();
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
      guardActivityLog[currentGuardId] = {
        time: {},
        totalTimeAsleep: 0,
      };
    }

    if (log[i].event === 'begin') {
      currentGuardId = log[i].guard;
    } else if (log[i].event === 'sleep') {
      // Check the next entry to see wake time
      // Sleep is start-time inclusive, end-time exclusive
      const sleepStart = log[i].time;
      const sleepEnd = log[i + 1].time;
      for (let j = sleepStart; j < sleepEnd; j++) {
        guardActivityLog[currentGuardId].time[j]
          ? guardActivityLog[currentGuardId].time[j]++
          : (guardActivityLog[currentGuardId].time[j] = 1);
      }

      // Finally, we'll save some time by increasing their total time asleep
      guardActivityLog[currentGuardId].totalTimeAsleep += sleepEnd - sleepStart;

      i++;
    }
  }
}

function findModeMinuteGuard() {
  const guards = Object.keys(guardActivityLog);

  const modeGuard = {
    guardId: null,
    modeMinute: null,
    timesAsleepOnMode: null,
  };

  guards.forEach(guard => {
    let mode = 0;
    let modeMinute = null;
    const minutes = Object.keys(guardActivityLog[guard].time);

    minutes.forEach(minute => {
      if (!modeMinute) modeMinute = minute;

      if (guardActivityLog[guard].time[minute] > mode) {
        mode = guardActivityLog[guard].time[minute];
        modeMinute = minute;
      }
    });

    // Compare to modeGuard object to see if current guard is mode...ier?
    if (modeGuard.timesAsleepOnMode < mode) {
      modeGuard.guardId = guard;
      modeGuard.modeMinute = modeMinute;
      modeGuard.timesAsleepOnMode = mode;
    }
  });

  console.log(`The guard with the mode-iest minute is guard #${modeGuard.guardId} on minute ${modeGuard.modeMinute} with ${modeGuard.timesAsleepOnMode} occurrences`);
  console.log(`The answer to challenge 4-2 is guardId * modeMinute, which is ${modeGuard.guardId * modeGuard.modeMinute}`);
}

init();
