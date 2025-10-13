import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../lib/chatbot-types';
import { processUserMessage, getConversationMessages, submitFeedback } from '../lib/chatbotService';

const SUGGESTED_QUESTIONS = [
  "What is the Great Bake Off?",
  "How do I submit an RFP response?",
  "What are the evaluation criteria?",
  "What's the difference between a slice and a layer?",
];

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chatbot_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('chatbot_session_id', newId);
    return newId;
  });
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: conversationId || '',
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let assistantContent = '';
      const assistantMessage: Message = {
        id: `temp_assistant_${Date.now()}`,
        conversation_id: conversationId || '',
        role: 'assistant',
        content: '',
        sources: [],
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const response = await processUserMessage(
        {
          message: messageText,
          conversation_id: conversationId,
          session_id: sessionId,
        },
        (chunk) => {
          assistantContent += chunk;
          setMessages(prev => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = assistantContent;
            }
            return updated;
          });
        }
      );

      setConversationId(response.conversation_id);

      setMessages(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.id = response.message_id;
          lastMessage.content = response.message;
          lastMessage.sources = response.sources;
        }
        return updated;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          conversation_id: conversationId || '',
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your message. Please try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, rating: 'positive' | 'negative') => {
    try {
      await submitFeedback(messageId, rating);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, feedback_rating: rating } : msg
        )
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-mn-accent-teal text-white p-4 rounded-full shadow-lg hover:bg-mn-primary transition-colors z-50"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 flex flex-col transition-all ${
        isMinimized ? 'h-16 w-80' : 'h-[600px] w-96'
      } max-w-[calc(100vw-3rem)] max-h-[calc(100vh-3rem)]`}
    >
      <div className="bg-mn-primary text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">MES Challenge Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-3">
                    Hello! I'm here to help answer questions about the MES Challenge. Ask me anything!
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-600">Try asking:</p>
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(question)}
                        className="block w-full text-left text-sm text-mn-accent-teal hover:text-mn-primary bg-white border border-gray-200 rounded-lg p-2 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-mn-accent-teal text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-300">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Sources:</p>
                          <div className="space-y-1">
                            {message.sources.map((source, idx) => (
                              <p key={idx} className="text-xs text-gray-600">
                                • {source.page}
                                {source.section && ` - ${source.section}`}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      {message.id && !message.id.startsWith('temp_') && (
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleFeedback(message.id, 'positive')}
                            className={`p-1 rounded transition-colors ${
                              message.feedback_rating === 'positive'
                                ? 'bg-green-100 text-green-600'
                                : 'hover:bg-gray-200 text-gray-500'
                            }`}
                            aria-label="Helpful"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, 'negative')}
                            className={`p-1 rounded transition-colors ${
                              message.feedback_rating === 'negative'
                                ? 'bg-red-100 text-red-600'
                                : 'hover:bg-gray-200 text-gray-500'
                            }`}
                            aria-label="Not helpful"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mn-accent-teal resize-none"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-mn-accent-teal text-white p-2 rounded-lg hover:bg-mn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
