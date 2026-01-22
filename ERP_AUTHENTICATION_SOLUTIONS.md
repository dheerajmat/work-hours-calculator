# 🚨 ERP Authentication Issue - Solutions

## ❌ The Problem

You're getting a **403 FORBIDDEN** error with this message:
```
User Guest does not have doctype access via role permission for document Employee Checkin
```

**What this means:**
- The login is NOT working properly
- You're accessing the API as a "Guest" (not logged in)
- Session cookies are not being maintained due to **CORS restrictions**

## 🔍 Why This Happens

**CORS (Cross-Origin Resource Sharing) Issue:**
- Your React app runs on `localhost:5173`
- ERP runs on `erp.naapbooks.com:9443`
- Browsers block session cookies between different origins for security
- Even though login succeeds, the session cookie is not sent with subsequent requests

## ✅ Solutions (In Order of Recommendation)

### **Solution 1: Use API Key Authentication** ⭐ RECOMMENDED

This is the BEST solution because API Keys work across origins!

#### Steps:
1. **Login to ERPNext** (in a regular browser tab)
   - Go to: https://erp.naapbooks.com:9443
   - Login with your credentials

2. **Generate API Key:**
   - Click your profile picture (top right)
   - Go to "My Settings" or "User"
   - Find "API Access" section
   - Click "Generate Keys" or "Create API Key"
   - Copy both the **API Key** and **API Secret**

3. **Configure in App:**
   - Click ⚙️ Settings
   - Select "API Key" authentication method
   - Paste your API Key and API Secret
   - Click "Test Connection"
   - Click "Save Settings"

4. **Fetch Data:**
   - Click "Fetch from ERP"
   - It will work! ✅

---

### **Solution 2: Install CORS Browser Extension**

This allows session cookies to work across origins.

#### For Chrome:
1. Install: [Allow CORS: Access-Control-Allow-Origin](https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
2. Enable the extension (click the icon, toggle ON)
3. Refresh your app
4. Try "Test Connection" again
5. Then "Fetch from ERP"

#### For Firefox:
1. Install: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)
2. Enable the extension
3. Refresh your app
4. Try again

**⚠️ Warning:** Remember to disable the extension when not using the app (security risk)

---

### **Solution 3: Ask IT to Enable CORS**

Contact your IT administrator and ask them to:

1. **Enable CORS in ERPNext** for your domain
2. Add this to ERPNext's `site_config.json`:
   ```json
   {
     "allow_cors": "*",
     "cors_allowed_origins": ["http://localhost:5173", "http://localhost:5174"]
   }
   ```

3. Restart ERPNext server

---

### **Solution 4: Manual Copy-Paste** (Always Works)

If automation doesn't work, the manual method is reliable:

1. Go to: https://erp.naapbooks.com:9443/app/employee-checkin/view/list
2. Filter by:
   - Employee: NB-24-0012
   - Date range: Current month
3. Select all data (Ctrl+A)
4. Copy (Ctrl+C)
5. Paste into the app textarea
6. Click "Parse Logs"

---

## 🎯 Recommended Approach

**For You (Dheeraj):**

Since you're getting the Guest user error, I recommend:

### **Option A: API Key (Best)**
1. Login to ERP in a regular browser
2. Generate API Key from your user settings
3. Use API Key in the app
4. No CORS issues! ✅

### **Option B: CORS Extension (Quick)**
1. Install "Allow CORS" extension
2. Enable it
3. Use username/password
4. Works immediately! ✅

---

## 📋 Quick Comparison

| Method | Pros | Cons | Recommended? |
|--------|------|------|--------------|
| **API Key** | ✅ No CORS issues<br>✅ More secure<br>✅ Always works | ❌ Need to generate key | ⭐ **YES** |
| **Username/Password + CORS Extension** | ✅ Quick setup<br>✅ No API key needed | ❌ Need browser extension<br>❌ Security risk | ⚠️ OK |
| **Username/Password (no extension)** | ✅ Simple | ❌ Doesn't work (CORS blocks cookies) | ❌ **NO** |
| **Manual Copy-Paste** | ✅ Always works<br>✅ No setup | ❌ Manual work | ✅ Fallback |

---

## 🔧 What I've Updated

I've improved the error handling to:
- ✅ Detect Guest user errors
- ✅ Provide clear error messages
- ✅ Suggest solutions
- ✅ Parse ERPNext error responses
- ✅ Recommend API Key authentication

---

## 🚀 Next Steps

**Choose your path:**

### Path 1: API Key (Recommended)
```
1. Login to ERP → Generate API Key
2. Copy API Key & Secret
3. Settings → API Key method
4. Paste keys → Test → Save
5. Fetch from ERP → Success! 🎉
```

### Path 2: CORS Extension
```
1. Install "Allow CORS" extension
2. Enable extension
3. Settings → Username/Password
4. Test Connection → Save
5. Fetch from ERP → Success! 🎉
```

---

## 💡 My Recommendation

**Use API Key!** It's:
- More reliable
- More secure
- No browser extensions needed
- Works across all browsers

**Let me know which solution you want to try, and I can help you set it up!** 🚀
