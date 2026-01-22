# Parser Update - Multi-line Format Support

## Problem
The application was showing the error:
> "No valid IN/OUT records found. Please check the format."

This occurred because the parser only supported single-line format, but the actual attendance system exports data in a multi-line format.

## Solution
Updated the parser (`src/utils/timeParser.ts`) to support **both formats**:

### Format 1: Multi-line (Now Supported!)
```
Employee Name
IN
19-01-2026 16:10:48
Approved
3 h
0
·

Employee Name
OUT
19-01-2026 15:31:15
Approved
```

**Key Features:**
- Each field on a separate line
- Extra lines (Approved, time indicators, dots) are automatically ignored
- Just paste the entire log output directly!

### Format 2: Single-line (Original)
```
Employee Name IN 19-01-2026 16:10:48
Employee Name OUT 19-01-2026 15:31:15
```

## How It Works

The parser now uses a **two-pass approach**:

1. **First Pass**: Try to parse as single-line format
2. **Second Pass**: If no records found, try multi-line format

This ensures backward compatibility while supporting the new format.

## Changes Made

### 1. Updated `src/utils/timeParser.ts`
- Added `dateTimeRegex` for matching date-time lines
- Enhanced `parsePunches()` function with multi-line support
- Added validation for date components
- Improved error handling

### 2. Updated `src/App.tsx`
- Better error messages showing expected format
- Console logging for debugging
- More helpful user feedback

### 3. Updated `README.md`
- Documented both supported formats
- Added examples with real data
- Clarified that extra lines are ignored

## Testing

Tested with sample data containing:
- 5 IN/OUT records
- Multiple employees (Dheeraj Deepak Mathur, Dave Dhruvil Chiragkumar)
- Extra lines (Approved, time indicators, dots)

**Result**: ✅ All 5 records parsed correctly!

## Usage

1. Copy your attendance logs from the system (including all the extra lines)
2. Paste directly into the text area
3. Click "Parse Logs"
4. The app will automatically detect the format and parse the data

## Example Data

You can now paste data like this directly:

```
Dave Dhruvil Chiragkumar
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
```

The parser will:
1. Identify "Dave Dhruvil Chiragkumar" as the employee name
2. Recognize "OUT" as the direction
3. Parse "19-01-2026 18:10:04" as the timestamp
4. **Ignore** "Approved", "1 h", "0", "·" and blank lines
5. Continue to the next record

## Benefits

✅ **No manual formatting needed** - paste directly from your system
✅ **Backward compatible** - old single-line format still works
✅ **Flexible** - handles extra lines and whitespace
✅ **Automatic detection** - no need to specify format
✅ **Better error messages** - tells you what format is expected

## Next Steps

To use the updated application:

```bash
npm run dev
```

Then open http://localhost:5173 and paste your logs!
