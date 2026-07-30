#!/bin/bash
# Change directory to project root
cd "$(dirname "$0")"

echo "=================================================="
echo "  Starting David Stokes Website & Journal Admin"
echo "=================================================="
echo ""

# Check if port 8080 is already running
if lsof -i :8080 > /dev/null 2>&1; then
    echo "Server is already running on http://localhost:8080"
else
    echo "Launching local dev server on http://localhost:8080..."
    node server.js &
    sleep 1
fi

echo "Opening Journal Admin in your default browser..."
open http://localhost:8080/admin

echo ""
echo "=================================================="
echo " Admin URL : http://localhost:8080/admin"
echo " Password  : davidstokes"
echo "=================================================="
echo ""
