import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ThumbsUp, ThumbsDown, Trash2, Copy, Check, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Message, Conversation } from '../lib/chatbot-types';
import {
  processUserMessage,
  getConversationMessages,
  getUserConversations,
  deleteConversation,
  submitFeedback
} from '../lib/chatbotService';

const SUGGESTED_QUESTIONS = [
  "What is the Great Bake Off?",
  "How do I submit a slice RFP response?",
  "What are the evaluation criteria for vendors?",
  "What's the difference between a slice and a layer?",
  "When are RFP submissions evaluated?",
  "What is the budget for the project?",
];

const Chatbot: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('chatbot_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('chatbot_session_id', newId);
    return newId;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const convos = await getUserConversations(sessionId);
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const msgs = await getConversationMessages(conversationId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(undefined);
    setMessages([]);
    inputRef.current?.focus();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      await deleteConversation(conversationId);
      if (currentConversationId === conversationId) {
        handleNewConversation();
      }
      await loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setInputValue('');
    setIsLoading(true);

    const userMessage: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: currentConversationId || '',
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      let assistantContent = '';
      const assistantMessage: Message = {
        id: `temp_assistant_${Date.now()}`,
        conversation_id: currentConversationId || '',
        role: 'assistant',
        content: '',
        sources: [],
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      const response = await processUserMessage(
        {
          message: messageText,
          conversation_id: currentConversationId,
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

      setCurrentConversationId(response.conversation_id);

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

      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          conversation_id: currentConversationId || '',
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

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-mn-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <MessageCircle className="h-10 w-10" />
              <h1 className="text-4xl font-bold">MES Challenge Assistant</h1>
            </div>
            <p className="text-xl text-white max-w-3xl mx-auto">
              Get instant answers about the MES modernization initiative, bake-off process, and requirements.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center space-x-2 bg-mn-accent-teal text-white px-4 py-3 rounded-lg hover:bg-mn-primary transition-colors font-semibold"
            >
              <Plus className="h-5 w-5" />
              <span>New Chat</span>
            </button>

            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-mn-primary mb-3">Conversation History</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <p className="text-sm text-gray-500">No conversations yet</p>
                ) : (
                  conversations.map(convo => (
                    <div
                      key={convo.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                        currentConversationId === convo.id
                          ? 'bg-mn-accent-teal text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <button
                          onClick={() => setCurrentConversationId(convo.id)}
                          className="flex-1 text-left"
                        >
                          <p className="text-sm font-medium truncate">
                            {convo.title || 'New Conversation'}
                          </p>
                          <p className={`text-xs mt-1 ${
                            currentConversationId === convo.id ? 'text-white text-opacity-80' : 'text-gray-500'
                          }`}>
                            {new Date(convo.created_at).toLocaleDateString()}
                          </p>
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(convo.id)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100 ${
                            currentConversationId === convo.id ? 'text-white hover:text-red-600' : 'text-red-600'
                          }`}
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg flex flex-col" style={{ height: 'calc(100vh - 300px)' }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-mn-accent-teal mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-mn-primary mb-2">
                      Welcome to the MES Challenge Assistant!
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      I can help you understand the Great Bake-Off process, RFP requirements, evaluation criteria, and more.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-mn-primary mb-4">Suggested Questions:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SUGGESTED_QUESTIONS.map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(question)}
                          className="text-left text-sm text-mn-accent-teal hover:text-mn-primary bg-white border border-gray-200 rounded-lg p-3 transition-colors hover:shadow-md"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl ${message.role === 'user' ? 'bg-mn-accent-teal text-white' : 'bg-gray-50'} rounded-lg p-4`}>
                    {message.role === 'assistant' ? (
                      <div>
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>

                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-300">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Sources:</p>
                            <div className="space-y-1">
                              {message.sources.map((source, idx) => (
                                <div key={idx} className="text-sm text-gray-600">
                                  <Link
                                    to={source.page}
                                    className="text-mn-accent-teal hover:text-mn-primary hover:underline"
                                  >
                                    • {source.page}
                                    {source.section && ` - ${source.section}`}
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 mt-4">
                          {message.id && !message.id.startsWith('temp_') && (
                            <>
                              <button
                                onClick={() => handleFeedback(message.id, 'positive')}
                                className={`p-2 rounded transition-colors ${
                                  message.feedback_rating === 'positive'
                                    ? 'bg-green-100 text-green-600'
                                    : 'hover:bg-gray-200 text-gray-500'
                                }`}
                                aria-label="Helpful"
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'negative')}
                                className={`p-2 rounded transition-colors ${
                                  message.feedback_rating === 'negative'
                                    ? 'bg-red-100 text-red-600'
                                    : 'hover:bg-gray-200 text-gray-500'
                                }`}
                                aria-label="Not helpful"
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleCopyMessage(message.content, message.id)}
                            className="p-2 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                            aria-label="Copy message"
                          >
                            {copiedMessageId === message.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about the MES Challenge..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-mn-accent-teal resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-mn-accent-teal text-white px-6 py-3 rounded-lg hover:bg-mn-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
