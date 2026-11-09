# TrustLens AI - Launch Both Backend & Frontend
# Run this file in Windows PowerShell: .\start_all.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "       Launching TrustLens AI Full-Stack App      " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start Backend in a new window
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host 'Starting TrustLens Backend...' -ForegroundColor Cyan; python run.py"

# Short pause
Start-Sleep -Seconds 2

# 2. Start Frontend in a new window
Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host 'Starting TrustLens Frontend...' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "Both servers are launching in attached windows!" -ForegroundColor Yellow
Write-Host "Open your browser at: http://localhost:5173" -ForegroundColor White
Write-Host "API Swagger Docs at:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Yellow
