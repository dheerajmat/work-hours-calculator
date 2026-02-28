# 🚀 Quick Setup Guide

## Step 1: Generate Icons (One-time)

Since Chrome needs PNG icons, you have 2 options:

### Option A: Use Online Converter (Easiest)
1. Open `generate-icons.html` in your browser
2. Click the download buttons to get all 3 icon sizes
3. Save them in the `chrome-extension` folder

### Option B: Use Any Image Editor
1. Create 3 PNG images with blue background and ⏱️ emoji:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)
2. Save them in the `chrome-extension` folder

### Option C: Skip Icons (Temporary)
1. Edit `manifest.json`
2. Remove the `"icons"` and `"default_icon"` sections
3. Extension will work but won't have an icon

## Step 2: Install Extension

1. Open Chrome
2. Go to: `chrome://extensions/`
3. Turn ON "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. Done! ✅

## Step 3: Test It

1. Go to your ERP attendance page
2. Click the extension icon (puzzle piece icon in Chrome toolbar)
3. Click "Copy Attendance Data"
4. Open Work Hours Calculator
5. Paste (Ctrl+V)
6. Should work! 🎉

## ⚠️ Important Notes

### The extension uses GENERIC extraction logic

It tries to find attendance data by looking for:
- Tables with IN/OUT and dates
- Divs/cards with attendance data

**If it doesn't work:**
You'll need to customize `content.js` for your specific ERP.

### How to Customize

1. Open your ERP page
2. Right-click on attendance data → Inspect
3. Note the HTML structure (class names, IDs, etc.)
4. Edit `content.js` and update the selectors

**Example:**
```javascript
// If your ERP has a table with id="attendance-table"
const table = document.getElementById('attendance-table');

// If your ERP has cards with class="punch-record"
const cards = document.querySelectorAll('.punch-record');
```

## 🆘 Need Help?

If the generic extraction doesn't work:
1. Open Chrome DevTools (F12) on your ERP page
2. Go to Console tab
3. Copy the HTML structure of your attendance data
4. I'll help you customize the extraction logic!

## 📝 What's Next?

Once basic extraction works, we can add:
- ✅ Auto-detection of your specific ERP
- ✅ Better error messages
- ✅ Settings page
- ✅ Direct sync with calculator (no copy-paste)
- ✅ Auto-refresh data
