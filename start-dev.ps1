<#
  start-dev.ps1
  Starts backend and frontend dev servers in separate PowerShell windows
  and prints clickable URLs to connect to the running apps.

  Usage (PowerShell):
    .\start-dev.ps1

  If ExecutionPolicy blocks the script, run:
    powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
#>

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $root 'backend'
$frontendPath = Join-Path $root 'frontend'

Write-Host "Starting ReParts backend and frontend..."

# Start backend in new PowerShell window
Start-Process -FilePath 'powershell' -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WorkingDirectory $backendPath

# Start frontend in new PowerShell window
Start-Process -FilePath 'powershell' -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WorkingDirectory $frontendPath

Start-Sleep -Seconds 1

Write-Host "Backend: http://localhost:5000/ (health: /health)" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173/" -ForegroundColor Cyan

Write-Host "If the URLs are not clickable, open them manually in your browser." -ForegroundColor Yellow
