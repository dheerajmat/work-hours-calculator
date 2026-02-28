# 🔧 Customization Guide

## How to Customize for Your ERP

The extension comes with generic extraction logic, but you'll likely need to customize it for your specific ERP.

## Step 1: Inspect Your ERP Page

1. Open your ERP attendance page
2. Press F12 to open DevTools
3. Click the "Elements" tab
4. Find the attendance data in the HTML

## Step 2: Identify the Structure

Look for patterns like:

### Example 1: Table Structure
```html
<table id="attendance-table">
  <tr>
    <td>Employee Name</td>
    <td>IN</td>
    <td>19-01-2026 10:30:00</td>
  </tr>
</table>
```

### Example 2: Card/Div Structure
```html
<div class="punch-record">
  <span>Employee Name</span>
  <span>IN</span>
  <span>19-01-2026 10:30:00</span>
</div>
```

### Example 3: List Structure
```html
<ul class="attendance-list">
  <li>Employee Name</li>
  <li>IN</li>
  <li>19-01-2026 10:30:00</li>
</ul>
```

## Step 3: Update content.js

Open `content.js` and modify the `extractAttendanceData()` function:

### For Specific Table ID:
```javascript
function extractAttendanceData() {
  // Replace 'attendance-table' with your table's ID
  const table = document.getElementById('attendance-table');
  
  if (table) {
    return extractFromTable(table);
  }
  
  return null;
}
```

### For Specific Class Name:
```javascript
function extractAttendanceData() {
  // Replace 'punch-record' with your element's class
  const records = document.querySelectorAll('.punch-record');
  
  if (records.length > 0) {
    return extractFromCards(records);
  }
  
  return null;
}
```

### For Complex Structure:
```javascript
function extractAttendanceData() {
  let extractedText = '';
  
  // Find all attendance records
  const records = document.querySelectorAll('.your-class-name');
  
  records.forEach(record => {
    // Extract name
    const name = record.querySelector('.employee-name')?.textContent.trim();
    
    // Extract direction (IN/OUT)
    const direction = record.querySelector('.punch-type')?.textContent.trim();
    
    // Extract datetime
    const datetime = record.querySelector('.punch-time')?.textContent.trim();
    
    if (name && direction && datetime) {
      extractedText += `${name}\n${direction}\n${datetime}\n\n`;
    }
  });
  
  return extractedText || null;
}
```

## Step 4: Test Your Changes

1. Save `content.js`
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Go to your ERP page
5. Click the extension button
6. Check if data is extracted correctly

## Common Patterns

### Pattern 1: Data in Attributes
```javascript
const datetime = record.getAttribute('data-timestamp');
```

### Pattern 2: Multiple Elements
```javascript
const cells = record.querySelectorAll('td');
const name = cells[0]?.textContent.trim();
const direction = cells[1]?.textContent.trim();
const datetime = cells[2]?.textContent.trim();
```

### Pattern 3: Nested Structure
```javascript
const container = document.querySelector('.attendance-container');
const records = container.querySelectorAll('.record-item');
```

## Need Help?

If you're stuck:
1. Copy the HTML structure from DevTools
2. Share it with me
3. I'll write the custom extraction code for you!

## Example: Real ERP Customization

Here's an example for a common ERP structure:

```javascript
function extractAttendanceData() {
  let extractedText = '';
  
  // Find the main attendance table
  const table = document.querySelector('table.attendance-grid');
  if (!table) return null;
  
  // Get all rows except header
  const rows = table.querySelectorAll('tbody tr');
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const name = cells[0].textContent.trim();
      const type = cells[1].textContent.trim();
      const datetime = cells[2].textContent.trim();
      
      extractedText += `${name}\n${type}\n${datetime}\n\n`;
    }
  });
  
  return extractedText || null;
}
```

Save this and test!
