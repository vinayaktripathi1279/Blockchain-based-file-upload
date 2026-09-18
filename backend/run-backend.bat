@echo off
setlocal
echo ========================================================
echo Starting Blockchain Secure File Transfer Portal Backend
echo ========================================================

REM Look for mvn in PATH or IntelliJ
where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    mvn spring-boot:run
    goto :end
)

if exist "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.2\plugins\maven\lib\maven3\bin\mvn.cmd" (
    "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2023.2\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run
    goto :end
)

echo ERROR: Maven was not found in PATH or IntelliJ directory.
echo Please ensure Maven is installed or run this project inside IntelliJ IDEA / Eclipse / VS Code.

:end
pause
