@echo off
echo ===================================================
echo   Starting OrCom Orbital Edge Platform
echo ===================================================

echo [1/2] Launching Backend API (Port 8000)...
start "OrCom Backend" cmd /k "cd /d ""%~dp0backend"" && python -m uvicorn app.main:app --port 8000 --reload"

echo [2/2] Launching Frontend Web App (Port 3000)...
start "OrCom Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm.cmd run dev"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening OrCom in browser...
start http://localhost:3000

echo ===================================================
echo OrCom is now running!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ===================================================
