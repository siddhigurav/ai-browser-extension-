@echo off
echo AI Assistant Extension Startup Script
echo ==================================

echo Starting backend server...
cd server
start "AI Assistant Server" python app.py
cd ..

echo.
echo Server started. Please wait a moment for it to initialize.
echo.
echo To load the extension in Chrome:
echo 1. Open Chrome and go to chrome://extensions/
echo 2. Enable "Developer mode" in the top right corner
echo 3. Click "Load unpacked" and select the "extension" directory
echo 4. The extension icon should now appear in your toolbar
echo.
echo You can now use the AI Assistant extension in your browser!
echo.
pause