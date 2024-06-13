@echo off
setlocal

REM Set the path to the Node.js script
set NODE_SCRIPT=dist/index.js

REM Set the interval for checking (in seconds)
set CHECK_INTERVAL=5

REM Set the initial command to start the server
set START_COMMAND=npm run build-and-run

:LOOP
REM Check if the Node.js process is running
tasklist /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq %NODE_SCRIPT%" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Node.js process is running.
) else (
    echo Node.js process is not running. Restarting...
    REM Start the Node.js server using the appropriate command
    call %START_COMMAND%
    echo Server restarted.
    REM Switch to npm run start for subsequent restarts
    set START_COMMAND=npm run start
)

REM Wait for the specified interval before checking again
timeout /t %CHECK_INTERVAL% /nobreak >NUL

REM Continue the loop
goto LOOP
