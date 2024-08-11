#!/bin/bash

# Change to the directory where this script is located
cd "$(dirname "$0")" || exit 1

# Activate the virtual environment
if [ -f ./.venv/Scripts/activate ]; then
    source ./.venv/Scripts/activate
else
    echo "Virtual environment activation script not found."
    exit 1
fi

# Install dependencies
pip install -r requirements.txt
if [ "$(pip install -r requirements.txt)" -ne 0 ]; then
    echo "Failed to install dependencies."
    exit 1
fi

# Clear existing files in the deployment package directory
if [ -d lambda-package ]; then
    rm -rf lambda-package
fi

# Create the deployment package directory
mkdir -p lambda-package

# Copy the Lambda function code to the deployment package directory
if [ -f lambda_function.py ]; then
    cp lambda_function.py lambda-package/
else
    echo "lambda_function.py not found."
    exit 1
fi

# Copy library folder
if [ -d library ]; then
    cp -r library lambda-package/library
else
    echo "library folder not found."
    exit 1
fi

# Copy resources folder
if [ -d resources ]; then
    cp -r resources lambda-package/resources
else
    echo "resources folder not found."
    exit 1
fi

# Copy helpers.py
if [ -f helpers.py ]; then
    cp helpers.py lambda-package/
else
    echo "helpers.py not found."
    exit 1
fi

# Copy routes.py
if [ -f routes.py ]; then
    cp routes.py lambda-package/
else
    echo "routes.py not found."
    exit 1
fi

# Copy the installed packages from the virtual environment to the deployment package directory
found_site_packages=false
for dir in .venv/lib/python3.*/site-packages; do
    if [ -d "$dir" ]; then
        cp -r "$dir"/* lambda-package/
        found_site_packages=true
        break
    fi
done

if [ "$found_site_packages" = false ]; then
    echo "site-packages not found."
    exit 1
fi

# Change to the deployment package directory
# cd lambda-package

# Zip the deployment package
# zip -r ../lambda-package.zip .

# Change back to the original directory
# cd ..

echo "Script completed successfully."
