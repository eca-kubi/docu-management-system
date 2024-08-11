@echo off
REM Change to the directory where this script is located
cd /d %~dp0

REM Activate the virtual environment
if exist .\.venv\Scripts\activate (
    call .\.venv\Scripts\activate
) else (
    echo Virtual environment activation script not found.
    exit /b 1
)

REM Install dependencies
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Failed to install dependencies.
    exit /b 1
)

if exist lambda-package (
    REM Clear existing files in the deployment package directory
    rmdir /s /q lambda-package\
)

REM Create the deployment package directory
mkdir lambda-package

REM Copy the Lambda function code to the deployment package directory
xcopy /y lambda_function.py lambda-package\
if %errorlevel% neq 0 (
    echo Failed to copy lambda_function.py.
    exit /b 1
)

REM Copy library folder
xcopy /s /y library\* lambda-package\library\
if %errorlevel% neq 0 (
    echo Failed to copy library folder.
    exit /b 1
)

REM Copy resources folder
xcopy /s /y resources\* lambda-package\resources\
if %errorlevel% neq 0 (
    echo Failed to copy resources folder.
    exit /b 1
)

REM Copy helpers.py
xcopy /y helpers.py lambda-package\
if %errorlevel% neq 0 (
    echo Failed to copy helpers.py.
    exit /b 1
)

REM Copy routes.py
xcopy /y routes.py lambda-package\
if %errorlevel% neq 0 (
    echo Failed to copy routes.py.
    exit /b 1
)

REM Copy requirements.txt
xcopy /y requirements.txt lambda-package\
if %errorlevel% neq 0 (
    echo Failed to copy requirements.txt
    exit /b 1
)

REM Copy the installed packages from the virtual environment to the deployment package directory
REM xcopy /s /y .venv\Lib\site-packages\* lambda-package\
REM if %errorlevel% neq 0 (
REM     echo Failed to copy site-packages.
REM     exit /b 1
REM )

REM Change to the deployment package directory
REM cd lambda-package

REM Zip the deployment package
REM powershell -command "Compress-Archive -Path * -DestinationPath ../lambda-package.zip -Force"

REM Change back to the original directory
REM cd ..

@echo on
