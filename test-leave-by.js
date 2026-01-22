// Test the leave by time calculation
const testData = `Dave Dhruvil Chiragkumar
OUT
19-01-2026 18:10:04
Approved
1 h
0
·

Dheeraj Deepak Mathur
IN
19-01-2026 16:10:48
Approved
3 h
0
·

Dheeraj Deepak Mathur
OUT
19-01-2026 15:31:15
Approved
3 h
0
·

Dave Dhruvil Chiragkumar
IN
19-01-2026 14:06:49
Approved
5 h
0
·

Dave Dhruvil Chiragkumar
OUT
19-01-2026 13:43:07
Approved
5 h
0
·

Dheeraj Deepak Mathur
IN
19-01-2026 10:54:14
Approved
8 h
0
·

Dave Dhruvil Chiragkumar
IN
19-01-2026 10:34:01
Approved
8 h
0
·`;

const dateTimeRegex = /^(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})$/;

function parsePunches(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const records = [];

  for (let i = 0; i < lines.length - 2; i++) {
    const nameLine = lines[i];
    const directionLine = lines[i + 1];
    const dateTimeLine = lines[i + 2];

    if (directionLine !== "IN" && directionLine !== "OUT") {
      continue;
    }

    const dateTimeMatch = dateTimeRegex.exec(dateTimeLine);
    if (!dateTimeMatch) {
      continue;
    }

    const [, dateStr, timeStr] = dateTimeMatch;
    const [d, m, y] = dateStr.split("-").map(Number);
    const [hh, mm, ss] = timeStr.split(":").map(Number);

    if (!d || !m || !y || !hh || isNaN(mm) || isNaN(ss)) {
      continue;
    }

    const dt = new Date(y, m - 1, d, hh, mm, ss);

    if (isNaN(dt.getTime())) {
      continue;
    }

    records.push({
      name: nameLine.trim(),
      direction: directionLine,
      datetime: dt,
    });

    i += 2;
  }

  return records;
}

function formatHoursMinutes(decimalHours) {
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

function timeStr(d) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function calculateLeaveByTime(lastInTime, hoursWorkedBefore) {
  const GOAL_HOURS = 8;
  const remainingHours = GOAL_HOURS - hoursWorkedBefore;
  
  if (remainingHours <= 0) {
    return "Goal already met!";
  }
  
  const leaveTime = new Date(lastInTime.getTime() + remainingHours * 60 * 60 * 1000);
  return timeStr(leaveTime);
}

function computeDailySummary(records) {
  const GOAL_HOURS = 8;
  const now = new Date();
  
  // Group by date AND employee name
  const byDateAndName = {};
  for (const r of records) {
    const dateKey = getDateKey(r.datetime);
    const key = `${dateKey}|${r.name}`;
    if (!byDateAndName[key]) byDateAndName[key] = [];
    byDateAndName[key].push(r);
  }

  const summaries = [];

  for (const [compositeKey, dayRecords] of Object.entries(byDateAndName)) {
    const dateKey = compositeKey.split('|')[0];
    const name = compositeKey.split('|')[1];
    
    dayRecords.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

    const intervals = [];
    let lastIn = null;
    let totalHours = 0;
    let currentlyWorking = false;
    let lastInTime = null;
    let hoursBeforeCurrentSession = 0;

    for (const r of dayRecords) {
      if (r.direction === "IN") {
        lastIn = r.datetime;
        lastInTime = r.datetime;
      } else if (r.direction === "OUT" && lastIn) {
        const diffMs = r.datetime.getTime() - lastIn.getTime();
        if (diffMs > 0) {
          const durationHours = diffMs / (1000 * 60 * 60);
          intervals.push({
            start: timeStr(lastIn),
            end: timeStr(r.datetime),
            durationHours: Math.round(durationHours * 100) / 100,
          });
          totalHours += durationHours;
          hoursBeforeCurrentSession = totalHours; // Track hours before current session
        }
        lastIn = null;
      }
    }

    // If last punch is IN, calculate ongoing work
    if (lastIn) {
      currentlyWorking = true;
      const diffMs = now.getTime() - lastIn.getTime();
      if (diffMs > 0) {
        const durationHours = diffMs / (1000 * 60 * 60);
        intervals.push({
          start: timeStr(lastIn),
          end: "Now",
          durationHours: Math.round(durationHours * 100) / 100,
        });
        totalHours += durationHours;
      }
    }

    const remaining = GOAL_HOURS - totalHours;

    const summary = {
      date: dateKey,
      name: name,
      totalHours: Math.round(totalHours * 100) / 100,
      totalFormatted: formatHoursMinutes(totalHours),
      intervals,
      remaining: Math.round(Math.abs(remaining) * 100) / 100,
      remainingFormatted: formatHoursMinutes(Math.abs(remaining)),
      isOvertime: remaining < 0,
      currentlyWorking,
    };

    // Calculate leave by time if currently working
    if (currentlyWorking && lastInTime) {
      summary.leaveByTime = calculateLeaveByTime(lastInTime, hoursBeforeCurrentSession);
    }

    summaries.push(summary);
  }

  summaries.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date > b.date ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return summaries;
}

console.log('Testing Leave By Time Calculation...\n');
console.log('Current time:', new Date().toLocaleString());
console.log('');

const records = parsePunches(testData);
const summaries = computeDailySummary(records);

summaries.forEach((summary, i) => {
  console.log(`${i + 1}. ${summary.date} - ${summary.name}`);
  console.log(`   Total: ${summary.totalFormatted}`);
  console.log(`   Goal (8h): ${summary.remainingFormatted} ${summary.isOvertime ? 'Overtime' : 'Remaining'}`);
  if (summary.currentlyWorking) {
    console.log(`   ⚠️  Currently Working`);
    if (summary.leaveByTime) {
      console.log(`   🕐 Leave by: ${summary.leaveByTime}`);
    }
  }
  console.log(`   Intervals:`);
  summary.intervals.forEach((interval, j) => {
    console.log(`     ${j + 1}. ${interval.start} - ${interval.end} (${formatHoursMinutes(interval.durationHours)})`);
  });
  console.log('');
});

console.log('='.repeat(80));
console.log('\n✅ Expected for Dheeraj:');
console.log('- Hours before current session: 4h 37m (10:54 to 15:31)');
console.log('- Remaining to reach 8h: 3h 23m');
console.log('- Last IN: 16:10');
console.log('- Leave by: 16:10 + 3h 23m = 19:33');
console.log('\nNote: If already worked 8h or more, should show "Goal already met!"');
