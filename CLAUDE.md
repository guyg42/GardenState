# Claude Code Instructions for GardenState

## Project Overview

**GardenState** is a Firebase-based web application for tracking plants and their care through AI-powered conversational entries. Users can create gardens, add plants, and have conversations with an AI assistant about plant care, with the AI providing personalized advice based on plant information and conversation history.

## Project Goals

1. **Plant Tracking**: Allow users to organize plants into gardens with detailed information
2. **Conversational Care**: Enable natural language conversations about plant care
3. **AI Intelligence**: Provide contextual, helpful gardening advice using plant history
4. **Multi-User**: Support collaborative gardens with role-based access
5. **Real-time**: Live updates and synchronization across devices

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Firebase SDK v9** (modular) for backend services

### Backend
- **Firebase Realtime Database** for data storage
- **Firebase Authentication** for user management
- **Firebase Cloud Functions** for AI processing
- **Firebase Storage** for file uploads (future)
- **Google AI Studio (Gemini Pro)** for AI responses

### Development
- **Firebase Emulators** for local development
- **Custom emulator data persistence** with crash protection
- **Environment-based configuration** (dev/prod)

## Architecture

### Data Structure
```
/gardens/{gardenId}
  - name: string
  - users: { [uid]: { role: 'owner' | 'collaborator' } }
  - plants: { [plantId]: { createdAt, createdBy } }
  - createdAt: string

/plants/{plantId}
  - gardenId: string
  - plantType?: string
  - nickname?: string
  - description?: string
  - dateAcquired?: string
  - ageWhenAcquired?: string
  - entries: { [entryId]: Entry }
  - createdAt: string
  - createdBy: string

/plants/{plantId}/entries/{entryId}
  - entryDate: string
  - name?: string (AI-generated if blank)
  - summary: string (AI-generated)
  - humanSummary?: string (user-written)
  - messages: { [messageId]: Message }
  - createdAt: string

/plants/{plantId}/entries/{entryId}/messages/{messageId}
  - uid: string
  - timestamp: string
  - content: string
  - role: 'user' | 'assistant'
  - images?: string[]

/users/{uid}
  - email: string
  - gardens: string[]
  - createdAt: string
```

### Component Structure
```
src/
├── components/
│   ├── Auth/
│   │   ├── AuthProvider.tsx      # Authentication context
│   │   └── LoginForm.tsx         # Login/signup form
│   ├── Gardens/
│   │   ├── GardenList.tsx        # Gardens overview
│   │   └── GardenCard.tsx        # Individual garden card
│   ├── Plants/
│   │   ├── PlantList.tsx         # Plants in a garden
│   │   ├── PlantCard.tsx         # Individual plant card
│   │   └── PlantDetail.tsx       # Plant details + entries
│   ├── Entries/
│   │   ├── EntryList.tsx         # Entry cards for a plant
│   │   ├── EntryChat.tsx         # Conversation interface
│   │   └── MessageBubble.tsx     # Individual message
│   └── Common/
│       ├── Layout.tsx            # App layout wrapper
│       └── LoadingSpinner.tsx    # Loading component
├── hooks/
│   ├── useAuth.ts                # Authentication logic
│   ├── useGardens.ts             # Garden data management
│   └── usePlants.ts              # Plant data management
├── types/
│   └── index.ts                  # TypeScript interfaces
├── utils/
│   └── firebase.ts               # Firebase configuration
└── App.tsx                       # Main app component
```

### AI Integration Flow

1. **Message Creation**: User sends message via EntryChat component
2. **Function Trigger**: Cloud Function triggers on new user message
3. **Context Building**: Function gathers plant info + conversation history
4. **AI Processing**: Gemini Pro generates contextual response
5. **Response Storage**: AI response saved to database
6. **Summary Generation**: AI creates/updates entry summary and name
7. **Real-time Update**: Frontend receives new message via Firebase listeners

## Development Setup

### Prerequisites
- Node.js 18+
- Java 11+ (for Firebase emulators)
- Firebase CLI
- Google AI Studio API key

### Initial Setup
```bash
# Clone and install dependencies
cd GardenState
npm install --prefix frontend --legacy-peer-deps
npm install --prefix backend/functions --legacy-peer-deps

# Set up environment variables
echo 'REACT_APP_USE_EMULATOR=true' > frontend/.env
echo 'GOOGLE_API_KEY=your_api_key_here' > backend/functions/.env
```

### **IMPORTANT: How to Launch for Development**

**Always use the automated script for emulator management:**

```bash
# Start emulators with data persistence and crash protection
./scripts/start-emulators.sh

# In separate terminal, start React dev server
cd frontend && npm start
```

**Never use manual Firebase commands** - the automated script provides:
- ✅ Data import/export on startup/shutdown
- ✅ Automatic backup every 60 seconds (crash protection)
- ✅ Health monitoring and cleanup
- ✅ Proper environment configuration

### **Emulator Ports** (Unique to avoid conflicts)
- **React App**: http://localhost:3100
- **Firebase Hosting**: http://127.0.0.1:5300
- **Emulator UI**: http://127.0.0.1:4300
- **Auth Emulator**: 127.0.0.1:9299
- **Database Emulator**: 127.0.0.1:9300
- **Functions Emulator**: 127.0.0.1:5201
- **Storage Emulator**: 127.0.0.1:9400

## Security Rules

### Realtime Database Rules
- **Users**: Read/write own user data only
- **Gardens**: Read if member, write if owner or creating new
- **Plants**: Read if garden member, write if garden member or creating new

### Key Security Features
- Authentication required for all operations
- Role-based access control for gardens
- User isolation for personal data
- Creation permissions for new resources

## AI Configuration

### Google AI Studio Setup
- **Model**: gemini-pro
- **API Key**: Stored in `backend/functions/.env`
- **Context Window**: Includes plant info + last 10 messages + entry summaries
- **Features**: 
  - Contextual gardening advice
  - Entry name generation (when blank)
  - Conversation summarization
  - Plant care recommendations

### AI Prompt Structure
```
System: You are a helpful gardening assistant...

Plant Information:
- Name: [nickname]
- Type: [plantType] 
- Description: [description]
- Acquired: [dateAcquired]
- Age when acquired: [ageWhenAcquired]

Previous entries for this plant:
[Entry summaries with dates]

Current entry notes from user: [humanSummary]

Conversation history:
[Last 10 messages]
```

## Common Development Tasks

### Adding New Features
1. Update TypeScript interfaces in `src/types/index.ts`
2. Update database security rules if needed
3. Create/modify React components
4. Add database operations in hooks
5. Test with emulator data persistence

### Debugging Issues
1. **Check emulator logs** in terminal running `./scripts/start-emulators.sh`
2. **Check browser console** for frontend errors
3. **Check Emulator UI** at http://127.0.0.1:4100 for data inspection
4. **Check function logs** for AI processing errors

### Database Schema Changes
1. Update TypeScript interfaces first
2. Modify security rules in `database.rules.json`
3. Update component logic
4. Test thoroughly with emulator data

## Deployment

### Production Environment Variables
- **Frontend**: Firebase production config in `firebase.ts`
- **Backend**: Set `GOOGLE_API_KEY` in Firebase Functions config
- **Database**: Use production Firebase project

### Deployment Commands
```bash
# Build frontend
cd frontend && npm run build

# Deploy all services
firebase deploy --project your-prod-project

# Deploy only functions
firebase deploy --only functions --project your-prod-project
```

## Troubleshooting

### Common Issues
1. **Loading screens**: Usually database listener timeout - check console logs
2. **Permission denied**: Update database security rules
3. **Function not triggering**: Check emulator logs and function configuration
4. **Data loss**: Use `./scripts/start-emulators.sh` for persistence

### Debug Tools
- Firebase Emulator UI for data inspection
- Browser console for frontend errors
- Terminal logs for emulator/function output
- Network tab for Firebase API calls

## File Organization Notes

- **Never modify** `firebase.json` emulator ports without updating docs
- **Always use** the automated emulator script
- **Keep** `EMULATOR_DATA.md` updated with any data management changes
- **Update** this file when adding major features or architectural changes