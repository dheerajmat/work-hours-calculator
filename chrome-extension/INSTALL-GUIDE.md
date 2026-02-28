# 📦 Installation Guide - Step by Step

## Before You Start

Make sure you have:
- ✅ Google Chrome browser installed
- ✅ The `chrome-extension` folder on your computer

---

## Step 1: Create Extension Icons

### Option A: Quick Method (Recommended)

1. Open `generate-icons.html` in Chrome
2. You'll see 3 preview icons
3. Click each download button:
   - Download 16x16
   - Download 48x48
   - Download 128x128
4. Save all 3 PNG files in the `chrome-extension` folder
5. Rename them to:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

### Option B: Skip Icons (Temporary)

If you want to skip icons for now:

1. Open `manifest.json` in a text editor
2. Find and DELETE these lines:
```json
"action": {
  "default_popup": "popup.html",
  "default_icon": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
},
```
Replace with:
```json
"action": {
  "default_popup": "popup.html"
},
```

3. Also DELETE:
```json
"icons": {
  "16": "icon16.png",
  "48": "icon48.png",
  "128": "icon128.png"
}
```

---

## Step 2: Open Chrome Extensions Page

1. Open Google Chrome
2. In the address bar, type: `chrome://extensions/`
3. Press Enter
4. You should see the Extensions management page

---

## Step 3: Enable Developer Mode

1. Look at the **top right** corner of the page
2. Find the toggle switch labeled **"Developer mode"**
3. Click it to turn it **ON** (it should turn blue)
4. New buttons will appear: "Load unpacked", "Pack extension", "Update"

---

## Step 4: Load the Extension

1. Click the **"Load unpacked"** button (top left area)
2. A file browser window will open
3. Navigate to your `chrome-extension` folder
4. Select the folder (don't go inside it, just select it)
5. Click **"Select Folder"** or **"Open"**

---

## Step 5: Verify Installation

You should now see your extension in the list:

```
ERP Attendance Extractor
Version 1.0.0
ID: [some random letters and numbers]
```

If you see any errors:
- Check that all files are in the folder
- Make sure icons exist (or you removed icon references)
- Click the "Errors" button to see details

---

## Step 6: Pin the Extension (Optional)

1. Look at the top right of Chrome (next to address bar)
2. Click the **puzzle piece icon** (Extensions)
3. Find "ERP Attendance Extractor"
4. Click the **pin icon** next to it
5. The extension icon will now appear in your toolbar

---

## Step 7: Test the Extension

### Test with Sample Data:

1. Open `test-page.html` in Chrome
2. Click the extension icon in toolbar
3. A popup should appear
4. Click **"Copy Attendance Data"**
5. You should see: "✅ Data copied to clipboard!"
6. Open Notepad and paste (Ctrl+V)
7. You should see the attendance data!

### Test with Real ERP:

1. Go to your ERP attendance page
2. Click the extension icon
3. Click **"Copy Attendance Data"**
4. If it works: Great! ✅
5. If not: See Troubleshooting below

---

## Troubleshooting

### Extension not showing in list?
- Make sure you selected the correct folder
- The folder should contain `manifest.json`
- Try clicking "Load unpacked" again

### "Manifest file is missing or unreadable" error?
- Check that `manifest.json` exists
- Open it in a text editor to verify it's valid JSON
- Make sure there are no syntax errors

### "Could not load icon" error?
- Either create the icon files (Step 1, Option A)
- Or remove icon references (Step 1, Option B)

### Extension loads but button doesn't work?
- Open Chrome DevTools (F12)
- Go to Console tab
- Click the extension button
- Look for error messages
- Share the errors for help

### No data extracted from ERP?
- The generic extraction might not match your ERP
- See CUSTOMIZE.md for customization instructions
- Share your ERP page structure for help

---

## Updating the Extension

If you make changes to the extension files:

1. Go to `chrome://extensions/`
2. Find your extension
3. Click the **refresh icon** (circular arrow)
4. The extension will reload with your changes

---

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find "ERP Attendance Extractor"
3. Click **"Remove"**
4. Confirm removal

---

## Next Steps

✅ Extension installed successfully!

Now:
1. Test with `test-page.html`
2. Try on your real ERP page
3. If it doesn't work, see CUSTOMIZE.md
4. Start using it daily!

---

## Need Help?

If you're stuck at any step:
1. Check the error message
2. Look in the Console (F12)
3. Share the error with me
4. I'll help you fix it!
