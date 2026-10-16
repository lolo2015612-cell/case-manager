@echo off
cd /d "%~dp0"
echo [1/3] Installing packages...
call npm install
if errorlevel 1 goto fail
echo [2/3] Preparing Electron (npm may block its install script)...
if exist node_modules\electron\install.js call node node_modules\electron\install.js
echo [3/3] Building installer...
call npm run dist
if errorlevel 1 goto fail
echo.
echo DONE. The installer is in the "release" folder.
start "" "%~dp0release"
pause
exit /b 0
:fail
echo.
echo FAILED. Copy the error text above and send it.
pause
exit /b 1
