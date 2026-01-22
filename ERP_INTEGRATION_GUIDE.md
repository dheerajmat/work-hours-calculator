# ERP Integration Guide

## 🎯 Overview

The Work Hours Calculator now supports automatic data fetching from your ERPNext system! No more manual copy-pasting.

## ✨ Features

- **Automatic Data Fetching**: Click a button to fetch your attendance data
- **Username/Password Authentication**: Login with your ERP credentials
- **Current Month Data**: Automatically fetches data for the current month
- **Auto-Parse**: Fetched data is automatically parsed and displayed
- **Secure Storage**: Credentials are stored locally in your browser

## 🚀 How to Use

### Step 1: Configure ERP Settings

1. Click the **⚙️ Settings** icon (top right of the input box)
2. Fill in the following details:
   - **ERP Base URL**: `https://erp.naapbooks.com:9443`
   - **Employee ID**: Your employee ID (e.g., `NB-24-0012`)
   - **Authentication Method**: Select "Username/Password"
   - **Username**: Your ERP username
   - **Password**: Your ERP password

3. Click **"Test Connection"** to verify your credentials
4. Click **"Save Settings"** to store the configuration

### Step 2: Fetch Data

1. Click the **"Fetch from ERP"** button
2. Wait for the data to be fetched (you'll see a loading indicator)
3. Data will automatically populate the textarea
4. Click **"Parse Logs"** to analyze the data

## 🔧 Troubleshooting

### CORS Errors

If you see a CORS error, you have these options:

#### Option 1: Install CORS Browser Extension (Easiest)
1. Install "Allow CORS: Access-Control-Allow-Origin" extension
   - Chrome: https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf
   - Firefox: https://addons.mozilla.org/en-US/firefox/addon/access-control-allow-origin/
2. Enable the extension
3. Try fetching data again

#### Option 2: Ask IT to Enable CORS
Contact your IT administrator and ask them to:
- Enable CORS for your domain in ERPNext
- Add your domain to the allowed origins list

#### Option 3: Use Manual Copy-Paste
If CORS cannot be resolved:
1. Go to: https://erp.naapbooks.com:9443/app/employee-checkin/view/list
2. Filter by your employee ID and date range
3. Copy all the data
4. Paste into the textarea
5. Click "Parse Logs"

### Authentication Errors

If login fails:
- Verify your username and password are correct
- Check if your account is active in ERPNext
- Ensure you have permission to access Employee Checkin data

### No Data Returned

If no data is fetched:
- Verify your Employee ID is correct
- Check if you have any check-ins for the current month
- Try a different date range

## 📋 Data Format

The fetched data will be in this format:
```
Employee Name
IN
DD-MM-YYYY HH:MM:SS
Approved
1 h
0
·

Employee Name
OUT
DD-MM-YYYY HH:MM:SS
Approved
2 h
0
·
```

## 🔒 Security

- **Local Storage**: Credentials are stored in your browser's localStorage
- **No Server**: No data is sent to any external server
- **Direct Connection**: Your browser connects directly to your ERP system
- **Clear Settings**: You can clear stored credentials anytime

## 💡 Tips

1. **First Time Setup**: Configure settings once, use forever
2. **Auto-Fetch**: Click "Fetch from ERP" at the start of each day
3. **Live Updates**: The calculator updates every second when you're currently working
4. **Notification Sound**: Get notified when you complete your 8-hour goal

## 🆘 Need Help?

If you encounter any issues:
1. Check the error message displayed
2. Try the troubleshooting steps above
3. Clear settings and reconfigure
4. Fall back to manual copy-paste method

## 🎉 Success!

Once configured, you can:
- ✅ Fetch data with one click
- ✅ See real-time work hours
- ✅ Track daily progress
- ✅ Monitor overtime and remaining hours
- ✅ View beautiful timeline visualizations

Enjoy your automated work hours tracking! 🚀
