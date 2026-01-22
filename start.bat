@echo off
echo ========================================
echo  Work Hours Calculator - Quick Start
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

echo Installing dependencies...
echo This may take a few minutes...
echo.

call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo Then open your browser to:
echo   http://localhost:5173
echo.
echo ========================================
echo.

set /p start="Would you like to start the dev server now? (Y/N): "
if /i "%start%"=="Y" (
    echo.
    echo Starting development server...
    echo Press Ctrl+C to stop the server
    echo.
    call npm run dev
) else (
    echo.
    echo You can start the server later by running:
    echo   npm run dev
    echo.
)

pause
