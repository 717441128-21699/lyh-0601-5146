@echo off
chcp 65001 > nul
echo ============================================
echo   在线编程竞赛平台 - 一键启动脚本
echo ============================================
echo.

echo [1/4] 检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo 检测到 Node.js:
node --version
npm --version
echo.

echo [2/4] 安装根目录依赖...
if not exist "node_modules" (
    call npm install
)
echo.

echo [3/4] 安装后端依赖...
cd backend
if not exist "node_modules" (
    call npm install
)
cd ..
echo.

echo [4/4] 安装前端依赖...
cd frontend
if not exist "node_modules" (
    call npm install
)
cd ..
echo.

echo ============================================
echo   依赖安装完成！
echo   请根据需要执行以下命令：
echo.
echo   启动开发模式(前后端同时):  npm run dev
echo   仅启动后端:                 npm run dev:backend
echo   仅启动前端:                 npm run dev:frontend
echo   初始化数据库:               npm run db:init
echo ============================================
echo.
pause
