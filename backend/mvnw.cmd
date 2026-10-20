@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script for Windows
@REM ----------------------------------------------------------------------------
@ECHO OFF
SETLOCAL EnableDelayedExpansion

SET "DIR=%~dp0"
SET "MAVEN_VERSION=3.9.9"
SET "MAVEN_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%"
SET "MAVEN_EXE=%MAVEN_DIR%\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd"

IF NOT EXIST "%MAVEN_EXE%" (
    ECHO [FieldOps] Baixando Apache Maven %MAVEN_VERSION% para execucao local...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $dest = Join-Path $env:TEMP 'apache-maven.zip'; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip' -OutFile $dest; New-Item -ItemType Directory -Force -Path '%MAVEN_DIR%' | Out-Null; Expand-Archive -Path $dest -DestinationPath '%MAVEN_DIR%' -Force; Remove-Item $dest -Force; }"
    ECHO [FieldOps] Maven baixado e configurado com sucesso!
)

CALL "%MAVEN_EXE%" %*
EXIT /B %ERRORLEVEL%
