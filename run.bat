@echo off
title AI Chat Website
echo ====================================================
echo          Starting AI Chat Assistant
echo ====================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not found. Please install Python 3.9+ and add it to PATH.
    pause
    exit /b 1
)

echo [1/2] Checking Python dependencies...
python -m pip install -r requirements.txt --quiet

echo [2/2] Launching AI Chat Web Server on http://localhost:8000 ...
echo.
echo Open your web browser and go to:
echo http://localhost:8000
echo.
echo Press Ctrl+C in this window to stop the server.
echo ====================================================
echo.

start http://localhost:8000
python -m uvicorn app:app --host 127.0.0.1 --port 8000

pause
