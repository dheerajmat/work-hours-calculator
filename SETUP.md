# Quick Setup Guide

## Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:5173`

## How to Use

### Step 1: Paste Your Logs
Copy your IN/OUT punch logs from your system and paste them into the text area.

### Step 2: Parse
Click the "Parse Logs" button to process the data.

### Step 3: View Results
- **Total Hours**: See cumulative hours across all days
- **Days Tracked**: Number of unique days in your logs
- **Daily Breakdown**: Detailed view of each day with:
  - Total hours worked
  - Remaining time or overtime (based on 8h goal)
  - Event timeline showing all IN/OUT pairs
  - Duration for each work interval

### Step 4: Today Features
Toggle "Today Only" to focus on current day:
- See real-time hours if you're currently clocked in
- View "Leave by" time to complete your 8-hour goal
- Auto-refreshes every minute for live updates

## Understanding Time Display

All times are shown in "hours and minutes" format:
- ✅ `7h 30m` = 7 hours 30 minutes
- ✅ `8h 15m` = 8 hours 15 minutes
- ❌ NOT `8.25` (which would be confusing)

## Goal Tracking

- **Green badge**: Time remaining to reach 8 hours
- **Amber badge**: Overtime beyond 8 hours
- **Blue badge**: "Leave by" time (only for today if currently working)

## Example Log Format

```
Dheeraj Deepak Mathur
IN
19-01-2026 10:54:14
Approved
1 h
0
·

Dheeraj Deepak Mathur
OUT
19-01-2026 15:31:15
Approved
2 h
0
·

Dheeraj Deepak Mathur
IN
19-01-2026 16:10:48
Approved
1 h
0
·
```

This will calculate:
- Work interval 1: 10:54 to 15:31 = 4h 37m
- Work interval 2: 16:10 to now (if ongoing) or next OUT
- Total: Sum of all intervals
- Break: Automatically detected (15:31 to 16:10)

## Tips

1. **Multiple days**: Paste logs from multiple days - they'll be grouped automatically
2. **Ongoing work**: If your last punch is IN and it's today, we'll calculate up to current time
3. **Leave time**: When working today, see exactly when to leave to hit 8 hours
4. **Auto-refresh**: The app updates every minute to keep "Now" time accurate

## Troubleshooting

- **No data showing**: Check that your log format matches the expected pattern
- **Wrong calculations**: Ensure IN/OUT punches are properly paired
- **Today not showing**: Make sure your system date matches the log dates

Enjoy tracking your work hours! 🎉
