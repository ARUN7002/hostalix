@echo off
SETLOCAL EnableDelayedExpansion

echo =====================================================================
echo   CLINICALCORE HOSPITAL MANAGEMENT SYSTEM - WINDOWS RUNTIME BOOT
echo =====================================================================
echo.

where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java runtime not found on PATH.
    echo Please install JDK 21 and configure JAVA_HOME.
    pause
    exit /b 1
)

where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Apache Maven not found on PATH.
    echo Please install Maven 3.9+ or run using the Maven Wrapper.
    pause
    exit /b 1
)

echo [OK] Java 21 and Maven detected.
echo [STAGE 1/2] Compiling and running automated JUnit test suite...
call mvn clean test
if %ERRORLEVEL% NEQ 0 (
    echo [FAILURE] Test suite did not pass 100%%. Aborting deployment.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [STAGE 2/2] Launching Spring Boot Application on http://localhost:8080 ...
call mvn spring-boot:run

pause
