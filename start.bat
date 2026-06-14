@echo off
chcp 65001 > nul
echo ============================================
echo   在线编程竞赛平台 - 开发模式
echo   正在启动前后端服务...
echo ============================================
echo.

cd /d "%~dp0"
call npm run dev
pause
