export type PunchRecord = {
  name: string;
  direction: "IN" | "OUT";
  datetime: Date;
};

export type WorkInterval = {
  start: string;
  end: string;
  durationHours: number;
};

export type DaySummary = {
  date: string; // 'YYYY-MM-DD'
  name: string;
  totalHours: number;
  totalFormatted: string; // 'Xh Ym'
  intervals: WorkInterval[];
  remaining: number; // hours remaining to reach 8h goal (negative if overtime)
  remainingFormatted: string;
  remainingFormattedWithSeconds: string; // 'Xh Ym Zs' with live seconds
  isOvertime: boolean;
  isToday: boolean;
  currentlyWorking: boolean;
  leaveByTime?: string; // Only for today if currently working
};

const lineRegex = /^(.+?)\s+(IN|OUT)\s+(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})/;
const dateTimeRegex = /^(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})$/;

/**
 * Parse raw text into punch records
 * Supports two formats:
 * 1. Single line: "Name IN DD-MM-YYYY HH:MM:SS"
 * 2. Multi-line: Name on one line, IN/OUT on next, DateTime on next
 */
export function parsePunches(raw: string): PunchRecord[] {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const records: PunchRecord[] = [];

  // Try single-line format first
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = lineRegex.exec(line);
    if (match) {
      const [, name, dir, dateStr, timeStr] = match;
      const [d, m, y] = dateStr.split("-").map(Number);
      const [hh, mm, ss] = timeStr.split(":").map(Number);
      const dt = new Date(y, m - 1, d, hh, mm, ss);
      records.push({
        name: name.trim(),
        direction: dir as "IN" | "OUT",
        datetime: dt,
      });
    }
  }

  // If no single-line records found, try multi-line format
  if (records.length === 0) {
    for (let i = 0; i < lines.length - 2; i++) {
      const nameLine = lines[i];
      const directionLine = lines[i + 1];
      const dateTimeLine = lines[i + 2];

      // Check if direction is IN or OUT
      if (directionLine !== "IN" && directionLine !== "OUT") {
        continue;
      }

      // Check if next line is a valid date-time
      const dateTimeMatch = dateTimeRegex.exec(dateTimeLine);
      if (!dateTimeMatch) {
        continue;
      }

      const [, dateStr, timeStr] = dateTimeMatch;
      const [d, m, y] = dateStr.split("-").map(Number);
      const [hh, mm, ss] = timeStr.split(":").map(Number);

      // Validate date components
      if (!d || !m || !y || !hh || isNaN(mm) || isNaN(ss)) {
        continue;
      }

      const dt = new Date(y, m - 1, d, hh, mm, ss);

      // Skip if date is invalid
      if (isNaN(dt.getTime())) {
        continue;
      }

      records.push({
        name: nameLine.trim(),
        direction: directionLine as "IN" | "OUT",
        datetime: dt,
      });

      // Skip the next 2 lines since we've processed them
      i += 2;
    }
  }

  return records;
}

/**
 * Format decimal hours to "Xh Ym" format
 */
export function formatHoursMinutes(decimalHours: number): string {
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

/**
 * Format decimal hours to "Xh Ym Zs" format with seconds
 */
export function formatHoursMinutesSeconds(decimalHours: number): string {
  const totalSeconds = Math.floor(decimalHours * 3600);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours === 0 && minutes === 0) {
    return `${seconds}s`;
  }
  if (hours === 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Format time as HH:MM
 */
function timeStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Format time as 12-hour format with AM/PM
 */
function timeStr12Hour(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

/**
 * Get date string in YYYY-MM-DD format
 */
function getDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Check if a date is today
 */
function isToday(date: Date): boolean {
  const today = new Date();
  return getDateKey(date) === getDateKey(today);
}

/**
 * Calculate leave by time for today if currently working
 * Returns the time when the 8-hour goal will be reached
 */
function calculateLeaveByTime(lastInTime: Date, hoursWorkedBefore: number): string {
  const GOAL_HOURS = 8;
  const remainingHours = GOAL_HOURS - hoursWorkedBefore;
  
  // If already met or exceeded goal before current session, return last IN time
  if (remainingHours <= 0) {
    return timeStr12Hour(lastInTime);
  }
  
  // Calculate when goal will be reached from last IN time
  const leaveTime = new Date(lastInTime.getTime() + remainingHours * 60 * 60 * 1000);
  return timeStr12Hour(leaveTime);
}

/**
 * Compute daily summaries from punch records
 */
export function computeDailySummary(
  records: PunchRecord[],
  todayOnly: boolean = false
): DaySummary[] {
  if (!records.length) return [];

  const GOAL_HOURS = 8;
  const now = new Date();
  const todayKey = getDateKey(now);

  // Group by date AND employee name
  const byDateAndName: Record<string, PunchRecord[]> = {};
  for (const r of records) {
    const dateKey = getDateKey(r.datetime);
    if (todayOnly && dateKey !== todayKey) continue;
    // Create a composite key: date + employee name
    const key = `${dateKey}|${r.name}`;
    if (!byDateAndName[key]) byDateAndName[key] = [];
    byDateAndName[key].push(r);
  }

  const summaries: DaySummary[] = [];

  for (const [compositeKey, dayRecords] of Object.entries(byDateAndName)) {
    // Extract date from composite key
    const dateKey = compositeKey.split('|')[0];
    
    // Sort by time
    dayRecords.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

    const intervals: WorkInterval[] = [];
    let lastIn: Date | null = null;
    let totalHours = 0;
    const isTodayDate = dateKey === todayKey;
    let currentlyWorking = false;
    let lastInTime: Date | null = null;
    let hoursBeforeCurrentSession = 0; // Track hours worked before current session

    // Process IN/OUT pairs
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
            durationHours: round2(durationHours),
          });
          totalHours += durationHours;
          hoursBeforeCurrentSession = totalHours; // Update before current session
        }
        lastIn = null;
      }
    }

    // If last punch is IN and it's today, calculate ongoing work
    if (lastIn && isTodayDate) {
      currentlyWorking = true;
      const diffMs = now.getTime() - lastIn.getTime();
      if (diffMs > 0) {
        const durationHours = diffMs / (1000 * 60 * 60);
        intervals.push({
          start: timeStr(lastIn),
          end: "Now",
          durationHours: round2(durationHours),
        });
        totalHours += durationHours;
      }
    }

    const remaining = GOAL_HOURS - totalHours;
    const isOvertime = remaining < 0;

    const summary: DaySummary = {
      date: dateKey,
      name: dayRecords[0]?.name || "Unknown",
      totalHours: round2(totalHours),
      totalFormatted: formatHoursMinutes(totalHours),
      intervals,
      remaining: round2(Math.abs(remaining)),
      remainingFormatted: formatHoursMinutes(Math.abs(remaining)),
      remainingFormattedWithSeconds: formatHoursMinutesSeconds(Math.abs(remaining)),
      isOvertime,
      isToday: isTodayDate,
      currentlyWorking,
    };

    // Calculate leave by time if currently working today
    if (currentlyWorking && lastInTime) {
      summary.leaveByTime = calculateLeaveByTime(lastInTime, hoursBeforeCurrentSession);
    }

    summaries.push(summary);
  }

  // Sort by date (most recent first), then by name
  summaries.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date > b.date ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  return summaries;
}

/**
 * Calculate overall statistics
 */
export function calculateOverallStats(summaries: DaySummary[]) {
  const GOAL_HOURS = 8;
  const totalHours = summaries.reduce((sum, s) => sum + s.totalHours, 0);
  const daysTracked = summaries.length;
  const expectedHours = daysTracked * GOAL_HOURS;
  
  // Find today's summary if currently working
  const todaySummary = summaries.find(s => s.isToday && s.currentlyWorking);
  
  // Projected total: current total + today's remaining (if working)
  let projectedTotalHours = totalHours;
  if (todaySummary && !todaySummary.isOvertime && todaySummary.remaining > 0) {
    // Add today's remaining hours to get projected total
    projectedTotalHours = totalHours + todaySummary.remaining;
  }
  
  // Calculate difference based on projected total
  const difference = projectedTotalHours - expectedHours;
  const isOvertime = difference > 0;
  
  // Actual difference (without projection)
  const actualDifference = totalHours - expectedHours;
  const actualIsOvertime = actualDifference > 0;
  
  // Count days with overtime and days with remaining hours
  const overtimeDays = summaries.filter(s => s.isOvertime).length;
  const remainingDays = summaries.filter(s => !s.isOvertime && s.remaining > 0).length;
  const completedDays = summaries.filter(s => !s.isOvertime && s.remaining === 0).length;
  
  // Calculate total overtime and total remaining
  const totalOvertime = summaries
    .filter(s => s.isOvertime)
    .reduce((sum, s) => sum + s.remaining, 0);
  const totalRemaining = summaries
    .filter(s => !s.isOvertime && s.remaining > 0)
    .reduce((sum, s) => sum + s.remaining, 0);
  
  // Adjusted remaining (excluding today if currently working)
  let adjustedRemaining = totalRemaining;
  if (todaySummary && !todaySummary.isOvertime && todaySummary.remaining > 0) {
    adjustedRemaining = totalRemaining - todaySummary.remaining;
  }

  return {
    totalHours: round2(totalHours),
    totalFormatted: formatHoursMinutes(totalHours),
    daysTracked,
    expectedHours: round2(expectedHours),
    expectedFormatted: formatHoursMinutes(expectedHours),
    difference: round2(Math.abs(difference)),
    differenceFormatted: formatHoursMinutes(Math.abs(difference)),
    isOvertime,
    actualDifference: round2(Math.abs(actualDifference)),
    actualDifferenceFormatted: formatHoursMinutes(Math.abs(actualDifference)),
    actualIsOvertime,
    projectedTotalHours: round2(projectedTotalHours),
    projectedTotalFormatted: formatHoursMinutes(projectedTotalHours),
    overtimeDays,
    remainingDays,
    completedDays,
    totalOvertime: round2(totalOvertime),
    totalOvertimeFormatted: formatHoursMinutes(totalOvertime),
    totalRemaining: round2(totalRemaining),
    totalRemainingFormatted: formatHoursMinutes(totalRemaining),
    adjustedRemaining: round2(adjustedRemaining),
    adjustedRemainingFormatted: formatHoursMinutes(adjustedRemaining),
    averageHoursPerDay: round2(totalHours / daysTracked),
    averageHoursPerDayFormatted: formatHoursMinutes(totalHours / daysTracked),
    isCurrentlyWorking: todaySummary?.currentlyWorking || false,
    todayRemaining: todaySummary?.remaining || 0,
    todayRemainingFormatted: todaySummary ? formatHoursMinutes(todaySummary.remaining) : '0h',
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
