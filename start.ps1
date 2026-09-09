Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting OrCom Orbital Edge Platform" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "[1/2] Launching Backend API (Port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList ("/k cd /d `"{0}\backend`" && python -m uvicorn app.main:app --port 8000 --reload" -f $PSScriptRoot)

Write-Host "[2/2] Launching Frontend Web App (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList ("/k cd /d `"{0}\frontend`" && npm.cmd run dev" -f $PSScriptRoot)

Start-Sleep -Seconds 3

Write-Host "Opening OrCom in browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "OrCom is now running!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:3000"
Write-Host "Backend API: http://localhost:8000"
Write-Host "API Docs:    http://localhost:8000/docs"
Write-Host "===================================================" -ForegroundColor Cyan
