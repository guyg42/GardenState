#!/bin/bash
# Minimal stable Firebase emulator startup
# Reduces features to improve stability

echo "🚀 Starting Firebase emulators (minimal mode)..."

# Set Java path for Firebase emulators
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"

cd "$(dirname "$0")/.."

# Start only essential services without auto-backup for stability
if [ -d "./emulator-data" ]; then
    echo "📦 Found existing emulator data, importing..."
    firebase emulators:start \
        --only auth,functions,database \
        --import ./emulator-data \
        --export-on-exit ./emulator-data \
        --project demo-project
else
    echo "📦 No existing data found, starting fresh..."
    firebase emulators:start \
        --only auth,functions,database \
        --export-on-exit ./emulator-data \
        --project demo-project
fi