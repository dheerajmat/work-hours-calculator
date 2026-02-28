# ERP Attendance Extractor - Chrome Extension

## 📋 What This Does

This Chrome extension extracts attendance data from your ERP page and copies it to clipboard in the correct format for the Work Hours Calculator.

## 🚀 Installation Steps

### Step 1: Load Extension in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `chrome-extension` folder
6. Extension is now installed! ✅

### Step 2: Use the Extension

1. Open your ERP attendance page
2. Click the extension icon in Chrome toolbar
3. Click **"Copy Attendance Data"** button
4. Go to Work Hours Calculator
5. Paste (Ctrl+V) in the text area
6. Data will auto-parse!

## 🔧 Customization

The extension uses generic extraction logic. If it doesn't work with your ERP:

1. Open your ERP page
2. Right-click → Inspect
3. Find the HTML structure of attendance data
4. Edit `content.js` to match your ERP's structure

### Common Customizations:

**If your ERP uses specific class names:**
```javascript
// In content.js, update the selector:
const cards = document.querySelectorAll('.your-class-name');
```

**If your ERP has a specific table ID:**
```javascript
// In content.js:
const table = document.getElementById('attendance-table');
```

## 📝 Testing

1. Open ERP page
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. You should see: "ERP Attendance Extractor loaded"
5. Click extension button
6. Check console for extraction logs

## ⚠️ Troubleshooting

**Extension not working?**
- Check if you're on the correct ERP page
- Open Console (F12) and look for errors
- The page structure might be different - needs customization

**No data extracted?**
- The generic extraction might not match your ERP
- You'll need to customize the selectors in `content.js`
- Contact me with your ERP page structure for help

## 🎯 Next Steps

Once you confirm it works, I can:
1. Add auto-detection for your specific ERP
2. Add better error messages
3. Add settings page for customization
4. Add direct sync with calculator (no copy-paste needed)
