import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        <div className={`break-words prose prose-sm max-w-none ${
          isUser 
            ? 'prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-em:text-white prose-code:text-white prose-li:text-white' 
            : 'prose-gray'
        }`}>
          <ReactMarkdown 
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              br: () => <br />,
              strong: ({ children }) => <strong className={isUser ? 'text-white font-bold' : 'text-gray-900 font-bold'}>{children}</strong>,
              em: ({ children }) => <em className={isUser ? 'text-white italic' : 'text-gray-800 italic'}>{children}</em>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              code: ({ children }) => (
                <code className={`px-1 py-0.5 rounded text-sm ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'
                }`}>
                  {children}
                </code>
              ),
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        
        {message.images && message.images.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.images.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Message attachment ${index + 1}`}
                className="max-w-full h-auto rounded"
              />
            ))}
          </div>
        )}
        
        <div className={`text-xs mt-1 ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};