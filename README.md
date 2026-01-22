# Work Hours Calculator

A modern React application for calculating work hours from IN/OUT punch logs.

## Features

- 📊 Parse raw IN/OUT logs from any system
- ⏱️ Calculate total working hours with automatic break detection
- 🎯 Track progress toward 8-hour daily goal
- 📈 Show overtime and remaining time per day
- 🕐 Live "Leave by" time calculation for today
- 🌙 Beautiful dark UI with Tailwind CSS
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Usage

1. **Paste your logs**: Copy your IN/OUT punch logs and paste them into the text area
2. **Parse**: Click "Parse Logs" to process the data
3. **View results**: See total hours, daily breakdowns, and time remaining/overtime
4. **Today filter**: Toggle "Today Only" to focus on current day
5. **Live updates**: If you're currently clocked in, see real-time hours and "Leave by" time

### Log Format

The app supports **two formats** for maximum flexibility:

#### Format 1: Multi-line (Most Common)
Each record has the employee name, direction (IN/OUT), and timestamp on separate lines:

```
Employee Name
IN
DD-MM-YYYY HH:MM:SS
Approved
...

Employee Name
OUT
DD-MM-YYYY HH:MM:SS
Approved
...
```

Example:
```
Dheeraj Deepak Mathur
IN
19-01-2026 10:54:14
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
```

**Note:** Extra lines like "Approved", "3 h", "0", "·" are automatically ignored. Just paste the entire log output!

#### Format 2: Single-line (Alternative)
All information on one line:

```
Employee Name IN DD-MM-YYYY HH:MM:SS
Employee Name OUT DD-MM-YYYY HH:MM:SS
```

Example:
```
Dheeraj Deepak Mathur IN 19-01-2026 10:54:14
Dheeraj Deepak Mathur OUT 19-01-2026 15:31:15
```

**The parser automatically detects which format you're using!**

## Features Explained

### Time Calculation
- Automatically pairs IN/OUT punches
- Calculates work intervals and breaks
- Shows time in "Xh Ym" format (e.g., "7h 30m")
- Handles ongoing work sessions (last IN without OUT)

### Daily Goals
- 8-hour daily goal
- Shows remaining time or overtime per day
- Color-coded badges (green for remaining, amber for overtime)

### Today Features
- Real-time calculation if currently clocked in
- "Leave by" time to complete 8 hours
- Auto-refreshes every minute

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Date/Time parsing and calculations

## License

MIT
