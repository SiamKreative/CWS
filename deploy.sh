#!/bin/sh
echo "Working directory: $PWD"
cd $PWD
gulp
cd dist
surge
echo Press Enter to Close...
read