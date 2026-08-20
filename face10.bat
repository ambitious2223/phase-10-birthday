@echo off
title Phase 10
echo Starting Phase 10...
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5174"

call npm run dev
pause
