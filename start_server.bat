@echo off
echo Starting AI Assistant Backend Server...
echo ======================================
echo.
echo Server will be available at http://localhost:5000
echo Press CTRL+C to stop the server
echo.
cd /d "%~dp0server"
python run_server.py
pause