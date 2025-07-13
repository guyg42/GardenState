import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, push, set, onValue, off, update } from 'firebase/database';
import { database } from '../../utils/firebase';
import { Entry, Message } from '../../types';
import { MessageBubble } from './MessageBubble';
import { useAuthContext } from '../Auth/AuthProvider';

export const EntryChat: React.FC = () => {
  const { gardenId, plantId, entryId } = useParams<{ gardenId: string; plantId: string; entryId: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  const [entry, setEntry] = useState<Entry | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    entryDate: '',
    name: '',
    humanSummary: ''
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!entryId) return;

    const entryRef = ref(database, `plants/${plantId}/entries/${entryId}`);
    
    const unsubscribe = onValue(entryRef, (snapshot) => {
      if (snapshot.exists()) {
        const entryData = snapshot.val();
        const entryWithId = { id: entryId, ...entryData };
        setEntry(entryWithId);
        
        // Update header form with current entry data
        setHeaderForm({
          entryDate: entryData.entryDate || entryData.createdAt?.split('T')[0] || '',
          name: entryData.name || '',
          humanSummary: entryData.humanSummary || ''
        });
        
        if (entryData.messages) {
          const messagesList = Object.entries(entryData.messages)
            .map(([id, message]: [string, any]) => ({
              id,
              ...message
            }))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          setMessages(messagesList);
        } else {
          setMessages([]);
        }
      }
      setLoading(false);
    });

    return () => off(entryRef, 'value', unsubscribe);
  }, [entryId, plantId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !entryId || sending) return;

    setSending(true);
    try {
      const messageRef = push(ref(database, `plants/${plantId}/entries/${entryId}/messages`));
      const messageData: Omit<Message, 'id'> = {
        uid: user.uid,
        timestamp: new Date().toISOString(),
        content: newMessage.trim(),
        role: 'user'
      };

      await set(messageRef, messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Image upload functionality will be implemented later
    console.log('Image upload selected:', e.target.files);
  };

  const handleEditHeader = () => {
    setIsEditingHeader(true);
  };

  const handleSaveHeader = async () => {
    if (!entryId) return;

    try {
      const entryRef = ref(database, `plants/${plantId}/entries/${entryId}`);
      await update(entryRef, {
        entryDate: headerForm.entryDate,
        name: headerForm.name,
        humanSummary: headerForm.humanSummary
      });
      setIsEditingHeader(false);
    } catch (error) {
      console.error('Error updating entry header:', error);
    }
  };

  const handleCancelHeaderEdit = () => {
    if (entry) {
      setHeaderForm({
        entryDate: entry.entryDate || entry.createdAt?.split('T')[0] || '',
        name: entry.name || '',
        humanSummary: entry.humanSummary || ''
      });
    }
    setIsEditingHeader(false);
  };

  const handleHeaderInputChange = (field: string, value: string) => {
    setHeaderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Entry not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/garden/${gardenId}/plant/${plantId}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {entry.name || `Entry ${entry.id.slice(-6)}`}
                </h1>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(entry.entryDate || entry.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            {!isEditingHeader && (
              <button
                onClick={handleEditHeader}
                className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingHeader && (
            <div className="pb-6 border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Date
                    </label>
                    <input
                      type="date"
                      value={headerForm.entryDate}
                      onChange={(e) => handleHeaderInputChange('entryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Name
                    </label>
                    <input
                      type="text"
                      value={headerForm.name}
                      onChange={(e) => handleHeaderInputChange('name', e.target.value)}
                      placeholder="Entry name (AI will suggest if left blank)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Summary
                  </label>
                  <textarea
                    value={headerForm.humanSummary}
                    onChange={(e) => handleHeaderInputChange('humanSummary', e.target.value)}
                    placeholder="Write your own notes about this entry..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    This summary will be included in the context for future AI conversations.
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveHeader}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelHeaderEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isEditingHeader && entry.humanSummary && (
            <div className="pb-6 border-t border-gray-200 pt-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <div className="text-sm font-medium text-blue-800 mb-1">Your Notes:</div>
                <div className="text-blue-700">{entry.humanSummary}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};