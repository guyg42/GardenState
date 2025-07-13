#!/bin/bash
# Manually export Firebase emulator data
# Use this while emulators are running to save current state

echo "💾 Exporting Firebase emulator data..."

cd "$(dirname "$0")/.."

# Export data from running emulators
firebase emulators:export ./emulator-data --project demo-project --force

if [ $? -eq 0 ]; then
    echo "✅ Data exported successfully to ./emulator-data"
else
    echo "❌ Failed to export data. Make sure emulators are running."
fi