import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Entry } from '../../types';

interface EntryListProps {
  entries: Entry[];
  onCreateEntry: () => void;
}

export const EntryList: React.FC<EntryListProps> = ({ entries, onCreateEntry }) => {
  const { gardenId, plantId } = useParams<{ gardenId: string; plantId: string }>();
  const navigate = useNavigate();

  const sortedEntries = entries.sort((a, b) => 
    new Date(b.entryDate || b.createdAt).getTime() - new Date(a.entryDate || a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
          onClick={() => navigate(`/garden/${gardenId}/plant/${plantId}/entry/${entry.id}`)}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {entry.name || `Entry ${entry.id.slice(-6)}`}
              </h3>
              <div className="text-sm text-gray-500">
                {new Date(entry.entryDate || entry.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {entry.humanSummary && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-1">Your Notes:</div>
              <p className="text-gray-800 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                {entry.humanSummary}
              </p>
            </div>
          )}
          
          {entry.summary && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-700 mb-1">AI Summary:</div>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-400">
                {entry.summary}
              </p>
            </div>
          )}
          
          {!entry.humanSummary && !entry.summary && (
            <p className="text-gray-500 mb-3 italic">No summary available</p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              <span>
                {entry.messages ? Object.keys(entry.messages).length : 0} messages
              </span>
            </div>
            <span>Click to continue conversation</span>
          </div>
        </div>
      ))}
      
      <button
        onClick={onCreateEntry}
        className="w-full bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center min-h-[120px]"
      >
        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="text-gray-600 font-medium">Start New Conversation</span>
      </button>
    </div>
  );
};