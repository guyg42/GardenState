export interface User {
  uid: string;
  email: string;
  gardens: string[];
  createdAt: string;
}

export interface Garden {
  id: string;
  users: {
    [userId: string]: {
      role: 'owner' | 'collaborator';
    };
  };
  plants: {
    [plantId: string]: {
      createdAt: string;
      createdBy: string;
    };
  };
}

export interface Plant {
  id: string;
  gardenId: string;
  createdAt: string;
  createdBy: string;
  plantType?: string;
  nickname?: string;
  description?: string;
  dateAcquired?: string;
  ageWhenAcquired?: string;
  entries: {
    [entryId: string]: Entry;
  };
}

export interface Entry {
  id: string;
  createdAt: string;
  entryDate: string;
  name?: string;
  summary: string;
  humanSummary?: string;
  messages: {
    [messageId: string]: Message;
  };
}

export interface Message {
  id: string;
  uid: string;
  timestamp: string;
  content: string;
  images?: string[];
  role: 'user' | 'assistant';
}