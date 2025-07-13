#!/bin/bash
# Start Firebase emulators with data persistence
# This script will import existing data, auto-export on shutdown, and backup every minute

echo "🚀 Starting Firebase emulators with data persistence..."

# Set Java path for Firebase emulators
export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"

cd "$(dirname "$0")/.."

# Function to export data periodically
auto_backup() {
    sleep 30  # Wait for emulators to fully start
    echo "⏰ Starting automatic backups every 60 seconds..."
    
    while true; do
        sleep 60
        if curl -s http://127.0.0.1:4600 > /dev/null 2>&1; then
            echo "💾 Auto-backup: $(date)"
            firebase emulators:export ./emulator-data --project demo-project --force > /dev/null 2>&1
        else
            echo "❌ Emulators not responding, stopping auto-backup"
            break
        fi
    done
}

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down..."
    if [ ! -z "$BACKUP_PID" ]; then
        kill $BACKUP_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start auto-backup in background
auto_backup &
BACKUP_PID=$!

# Check if emulator data exists and start emulators
if [ -d "./emulator-data" ]; then
    echo "📦 Found existing emulator data, importing..."
    firebase emulators:start \
        --import ./emulator-data \
        --export-on-exit ./emulator-data \
        --project demo-project
else
    echo "📦 No existing data found, starting fresh with auto-export..."
    firebase emulators:start \
        --export-on-exit ./emulator-data \
        --project demo-project
fi

# Cleanup when emulators exit
cleanup