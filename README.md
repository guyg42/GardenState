# Garden Tracker Web App

A Firebase-based gardening web application where users can track their gardens and plants, with an AI-powered chat interface for each plant entry.

## Features

- 🌱 **Garden Management**: Create and manage multiple gardens
- 🪴 **Plant Tracking**: Add plants to gardens and track their progress
- 💬 **AI Chat Interface**: Chat with an AI assistant about each plant
- 📸 **Image Support**: Upload images in conversations (planned)
- 👥 **Multi-user Support**: Share gardens with other users (planned)
- 📱 **Responsive Design**: Works on desktop and mobile

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Realtime Database, Storage, Cloud Functions)
- **Chat UI**: Custom React components
- **LLM Integration**: LangChain.js with OpenAI

## Project Structure

```
GardenState/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                 # Firebase Cloud Functions
│   └── functions/
│       ├── index.js         # Main Cloud Function
│       └── package.json
├── firebase.json           # Firebase configuration
├── database.rules.json     # Database security rules
└── storage.rules          # Storage security rules
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with the provided configuration

### Installation

1. **Clone and setup the project**:
   ```bash
   git clone <repository-url>
   cd GardenState
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd ../backend/functions
   npm install
   ```

4. **Configure Firebase**:
   ```bash
   firebase login
   firebase use gardenstate-test
   ```

5. **Set up environment variables for Cloud Functions**:
   ```bash
   firebase functions:config:set openai.api_key="your-openai-api-key"
   ```

### Development

1. **Start the frontend development server**:
   ```bash
   cd frontend
   npm start
   ```

2. **Start Firebase emulators** (optional, for local testing):
   ```bash
   firebase emulators:start
   ```

### Deployment

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Firebase**:
   ```bash
   cd ..
   firebase deploy
   ```

## Database Structure

```json
{
  "users": {
    "userId": {
      "email": "user@example.com",
      "gardens": ["gardenId1", "gardenId2"],
      "createdAt": "timestamp"
    }
  },
  "gardens": {
    "gardenId": {
      "users": {
        "userId": { "role": "owner" }
      },
      "plants": {
        "plantId": {
          "createdAt": "timestamp",
          "createdBy": "userId"
        }
      }
    }
  },
  "plants": {
    "plantId": {
      "gardenId": "gardenId",
      "entries": {
        "entryId": {
          "createdAt": "timestamp",
          "summary": "AI-generated summary",
          "messages": {
            "messageId": {
              "uid": "userId",
              "timestamp": "timestamp",
              "content": "message text",
              "role": "user|assistant"
            }
          }
        }
      }
    }
  }
}
```

## User Flow

1. **Authentication**: Login with email/password or Google Sign-In
2. **Gardens Dashboard**: View all accessible gardens, create new ones
3. **Garden View**: See all plants in a garden, add new plants
4. **Plant Detail**: View plant overview and conversation entries
5. **Entry Chat**: Chat with AI assistant about the plant

## Security

- Database security rules ensure users can only access their gardens
- Storage rules protect uploaded images
- Authentication required for all operations

## Future Enhancements

- Image upload and compression
- Garden sharing with multiple users
- Plant care reminders
- Advanced plant identification
- Export capabilities
- Mobile app

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details