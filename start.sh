#!/bin/bash

echo "========================================"
echo " Work Hours Calculator - Quick Start"
echo "========================================"
echo ""

echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[OK] Node.js is installed: $(node --version)"
echo ""

echo "Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to install dependencies!"
    echo "Please check your internet connection and try again."
    exit 1
fi

echo ""
echo "========================================"
echo " Installation Complete!"
echo "========================================"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:5173"
echo ""
echo "========================================"
echo ""

read -p "Would you like to start the dev server now? (y/n): " start
if [[ $start == "y" || $start == "Y" ]]; then
    echo ""
    echo "Starting development server..."
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo ""
    echo "You can start the server later by running:"
    echo "  npm run dev"
    echo ""
fi
