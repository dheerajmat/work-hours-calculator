# 🚀 Installation & Running Guide

## Prerequisites

Make sure you have Node.js installed. You already have Node.js v22.19.0 installed! ✅

If npm is not available, you can use one of these alternatives:

### Option 1: Using npm (Recommended)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Option 2: Using yarn

```bash
# Install yarn if not already installed
npm install -g yarn

# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

### Option 3: Using pnpm

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📋 Step-by-Step Setup

### 1. Navigate to Project Directory

```bash
cd D:\work-hours-calculator
```

### 2. Install Dependencies

Choose one of the package managers above and run the install command.

### 3. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 4. Open in Browser

The terminal will show you the local URL (usually `http://localhost:5173`). Open it in your browser.

## 🎯 Quick Test

Once the app is running:

1. **Copy this sample log**:
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

2. **Paste it** into the text area in the app

3. **Click "Parse Logs"**

4. **See the results**:
   - Total hours calculated
   - Daily breakdown with timeline
   - Remaining time or overtime

## 🔧 Troubleshooting

### Issue: npm not found

**Solution**: npm should come with Node.js. Try reinstalling Node.js from [nodejs.org](https://nodejs.org/)

### Issue: Port 5173 already in use

**Solution**: The dev server will automatically try the next available port (5174, 5175, etc.)

### Issue: Module not found errors

**Solution**: Make sure you ran the install command first:
```bash
npm install
```

### Issue: Tailwind styles not loading

**Solution**: 
1. Stop the dev server (Ctrl+C)
2. Delete `node_modules` folder
3. Run `npm install` again
4. Run `npm run dev`

## 📱 Accessing from Other Devices

To access the app from your phone or other devices on the same network:

1. Start the dev server with network access:
```bash
npm run dev -- --host
```

2. Look for the "Network" URL in the terminal output (e.g., `http://192.168.1.x:5173`)

3. Open that URL on your other device

## 🏗️ Building for Production

When you're ready to deploy:

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist` folder, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)

## 📚 Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Tailwind CSS Documentation**: https://tailwindcss.com/
- **TypeScript Documentation**: https://www.typescriptlang.org/

## 🎉 You're All Set!

Your Work Hours Calculator app is ready to use. Enjoy tracking your work hours! 🚀

---

**Need Help?** Check the following files:
- `README.md` - Project overview and features
- `SETUP.md` - Detailed usage guide
- `PROJECT_SUMMARY.md` - Complete technical documentation
