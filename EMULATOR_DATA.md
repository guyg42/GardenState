# Firebase Emulator Data Management

## Overview
The Firebase emulators don't persist data between restarts by default. This document contains instructions for exporting/importing emulator data and scripts to automate the process.

## Manual Commands

### Export Data
```bash
# Export all emulator data to ./emulator-data directory
firebase emulators:export ./emulator-data --project demo-project

# Export specific services
firebase emulators:export ./emulator-data --only auth,database --project demo-project
```

### Import Data
```bash
# Start emulators with imported data
firebase emulators:start --import ./emulator-data --project demo-project

# Start and auto-export on shutdown
firebase emulators:start --import ./emulator-data --export-on-exit ./emulator-data --project demo-project
```

## Automated Scripts

### Quick Start Script (with auto-save + crash protection)
Use this script to start emulators with data persistence:
```bash
./scripts/start-emulators.sh
```

**Features:**
- ✅ Imports existing data on startup
- ✅ Exports data on graceful shutdown (Ctrl+C)
- ✅ **Automatic backup every 60 seconds** (crash protection)
- ✅ Monitors emulator health and stops backup if crashed

### Export Current Data Script
Use this to manually save current emulator data:
```bash
./scripts/export-data.sh
```

## Directory Structure
```
/GardenState/
├── emulator-data/          # Exported emulator data
│   ├── auth_export/        # Authentication data
│   ├── database_export/    # Realtime Database data
│   └── storage_export/     # Storage data
├── scripts/                # Automation scripts
│   ├── start-emulators.sh  # Start with data import/export
│   └── export-data.sh      # Manual export script
└── EMULATOR_DATA.md        # This file
```

## Notes
- Data is automatically exported when emulators shut down gracefully (Ctrl+C)
- Force-killing emulators may lose unsaved data
- The `emulator-data` directory is gitignored to avoid committing test data
- Always use the provided scripts to ensure data persistence