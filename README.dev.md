# Local Development Setup

This guide will help you set up the Garden Tracker app for local development with Firebase emulators running on custom ports to avoid conflicts with other applications.

## Custom Ports Configuration

The app is configured to use the following custom ports:

- **React Dev Server**: `3100` (instead of default 3000)
- **Firebase Emulator UI**: `4100` (instead of default 4000)
- **Firebase Hosting**: `5100` (instead of default 5000)
- **Firebase Functions**: `5101` (instead of default 5001)
- **Firebase Realtime Database**: `9100` (instead of default 9000)
- **Firebase Auth**: `9199` (instead of default 9099)
- **Firebase Storage**: `9199` (shared with Auth)

## Quick Start

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start local development** (runs both emulators and frontend):
   ```bash
   npm run dev
   ```

This will:
- Start Firebase emulators on the custom ports
- Start React development server on port 3100
- Automatically configure the frontend to use emulators

## Manual Setup

If you prefer to run components separately:

1. **Start Firebase emulators**:
   ```bash
   npm run emulators
   ```

2. **In a separate terminal, start the frontend**:
   ```bash
   npm run frontend:dev
   ```

## Access Points

Once running, you can access:

- **Web App**: http://localhost:3100
- **Firebase Emulator UI**: http://localhost:4100
- **Hosting Emulator**: http://localhost:5100

## Environment Variables

The app automatically detects when to use emulators based on:
- `NODE_ENV=development` 
- `REACT_APP_USE_EMULATOR=true`

These are set automatically when using `npm run frontend:dev` or `npm run dev`.

## Emulator Data

Emulators start fresh each time. To import/export data:

```bash
# Export emulator data
firebase emulators:export ./emulator-data

# Import emulator data on start
firebase emulators:start --import=./emulator-data
```

## Troubleshooting

### Port Conflicts
If you still have port conflicts, you can modify the ports in:
- `firebase.json` (emulator ports)
- `frontend/package.json` (React dev server port)
- `.env.local` (PORT variable)

### Emulator Connection Issues
If the frontend can't connect to emulators:
1. Ensure emulators are running first
2. Check that `REACT_APP_USE_EMULATOR=true` is set
3. Verify ports match between `firebase.json` and `firebase.ts`

### Functions Debugging
To debug Cloud Functions locally:
```bash
cd backend/functions
npm run serve
```

## Production Deployment

When ready to deploy to production:

```bash
npm run deploy
```

This builds the frontend and deploys both frontend and backend to Firebase.

## Testing

The emulator setup includes test data isolation. Each test run gets a fresh database state.