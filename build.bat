@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   Terraria Properties Generator Build
echo ========================================
echo.

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

echo [1/3] Building renderer...
call npm run build:renderer
if errorlevel 1 (
    echo Failed to build renderer!
    pause
    exit /b 1
)
echo Renderer built successfully!

echo.
echo [2/3] Building main process...
call npm run build:main
if errorlevel 1 (
    echo Failed to build main process!
    pause
    exit /b 1
)
echo Main process built successfully!

echo.
echo [3/3] Packaging with electron-builder...
call npx electron-builder --win --dir
if errorlevel 1 (
    echo Failed to package!
    pause
    exit /b 1
)
echo.

echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Output: release\win-unpacked\Terraria Properties Generator.exe
echo.
pause
