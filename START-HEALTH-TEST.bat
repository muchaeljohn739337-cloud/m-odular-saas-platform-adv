@echo off
REM ========================================
REM START-HEALTH-TEST.bat
REM One-click backend server + API tests
REM ========================================

echo.
echo ========================================
echo   ADVANCIA PAY LEDGER - HEALTH TEST
echo ========================================
echo.
echo Opening two terminals:
echo   1. Backend Server (port 4000)
echo   2. API Health Tests
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"

REM Terminal 1: Start backend server
start "Backend Server - Port 4000" cmd /k "cd /d "%SCRIPT_DIR%backend" && echo Starting backend server... && npm run dev"

REM Wait 5 seconds for server to start
timeout /t 5 /nobreak >nul

REM Terminal 2: Run health checks and API tests
start "API Health Tests" powershell -NoProfile -ExecutionPolicy Bypass -NoExit -Command "cd '%SCRIPT_DIR%backend'; Write-Host ''; Write-Host '========================================' -ForegroundColor Yellow; Write-Host '  RUNNING API HEALTH TESTS' -ForegroundColor Yellow; Write-Host '========================================' -ForegroundColor Yellow; Write-Host ''; Start-Sleep -Seconds 6; Write-Host '[1/4] Health Check...' -ForegroundColor Cyan; try { $result = Invoke-RestMethod -Uri 'http://localhost:4000/health'; Write-Host 'SUCCESS: Backend is healthy!' -ForegroundColor Green; $result | ConvertTo-Json; Write-Host '' } catch { Write-Host 'FAILED: Cannot connect to backend' -ForegroundColor Red; Write-Host $_.Exception.Message; Write-Host '' }; Write-Host '[2/4] POST Transaction...' -ForegroundColor Cyan; try { $body = @{ userId = 'user_1'; amount = 150.00; type = 'credit' } | ConvertTo-Json; $result = Invoke-RestMethod -Uri 'http://localhost:4000/api/transaction' -Method POST -ContentType 'application/json' -Body $body; Write-Host 'SUCCESS: Transaction created!' -ForegroundColor Green; $result | ConvertTo-Json -Depth 5; Write-Host '' } catch { Write-Host 'FAILED: Cannot create transaction' -ForegroundColor Red; Write-Host $_.Exception.Message; Write-Host '' }; Write-Host '[3/4] GET Recent Transactions...' -ForegroundColor Cyan; try { $result = Invoke-RestMethod -Uri 'http://localhost:4000/api/transaction/recent/user_1'; Write-Host 'SUCCESS: Transactions retrieved!' -ForegroundColor Green; $result | ConvertTo-Json -Depth 5; Write-Host '' } catch { Write-Host 'FAILED: Cannot fetch transactions' -ForegroundColor Red; Write-Host $_.Exception.Message; Write-Host '' }; Write-Host '[4/4] GET Balance...' -ForegroundColor Cyan; try { $result = Invoke-RestMethod -Uri 'http://localhost:4000/api/transactions/balance/user_1'; Write-Host 'SUCCESS: Balance calculated!' -ForegroundColor Green; $result | ConvertTo-Json -Depth 5; Write-Host '' } catch { Write-Host 'FAILED: Cannot calculate balance' -ForegroundColor Red; Write-Host $_.Exception.Message; Write-Host '' }; Write-Host '========================================' -ForegroundColor Yellow; Write-Host '  ALL TESTS COMPLETE' -ForegroundColor Yellow; Write-Host '========================================' -ForegroundColor Yellow; Write-Host ''; Write-Host 'Press any key to close this window or keep testing manually...'; Write-Host ''"

echo.
echo ========================================
echo   Terminals opened successfully!
echo ========================================
echo.
echo Check the two new windows:
echo   - Backend Server: Running on port 4000
echo   - API Tests: Automated health checks
echo.
echo Press any key to exit this launcher...
pause >nul
