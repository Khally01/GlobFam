#!/bin/bash
# This script renames Dockerfile to force Railway to use Nixpacks

if [ -f "Dockerfile" ]; then
    rm Dockerfile
    echo "Dockerfile removed to force Nixpacks usage"
else
    echo "Dockerfile not found"
fi