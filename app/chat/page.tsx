'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LLMModel } from '@/types';
import { Send, Bot, User, Sparkles, Bookmark, Star, Settings as SettingsIcon, Wand2, Mic, Globe, Image as ImageIcon, Rocket, FileText, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const { user } = useUser();
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    piiDetected?: boolean; 
    cost?: number; 
    tokens?: number;
    modelName?: string;
    success?: boolean;
  }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [multiModelMode, setMultiModelMode] = useState(false);
  const [useRAG, setUseRAG] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user) {
      fetchModels();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (!res.ok) {
        console.error('Failed to fetch models:', res.statusText);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setModels(data);
        if (data.length > 0) {
          setSelectedModel(data[0].id);
        }
      } else {
        console.error('Models API did not return an array:', data);
        setModels([]);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setModels([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!multiModelMode && !imageMode && !selectedModel) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    const newMessage = { 
      role: 'user' as const, 
      content: userMessage,
      piiDetected: false, // Will be updated if PII is detected
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      if (multiModelMode) {
        // Multi-model comparison mode
        const res = await fetch('/api/chat/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          // Add all model responses
          data.results.forEach((result: any) => {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: result.content,
                piiDetected: data.piiDetected,
                cost: result.cost,
                tokens: result.inputTokens + result.outputTokens,
                modelName: result.modelName,
                success: result.success,
              },
            ]);
          });
        } else {
          throw new Error(data.error || 'Failed to compare models');
        }
      } else if (imageMode) {
        // Image generation mode
        const res = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `![Generated Image](${data.imageUrl})`,
            },
          ]);
        } else {
          throw new Error(data.error || 'Failed to generate image');
        }
      } else {
        // Single model mode
        const res = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            sessionId,
            modelId: selectedModel,
            useRAG,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setSessionId(data.sessionId);
          // Update user message if it was redacted
          if (data.piiDetected && data.redactedMessage) {
            setMessages((prev) => {
              const updated = [...prev];
              const lastUserMsg = updated[updated.length - 1];
              if (lastUserMsg && lastUserMsg.role === 'user') {
                lastUserMsg.content = data.redactedMessage;
                lastUserMsg.piiDetected = true;
              }
              return updated;
            });
          }
          
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: data.message,
              piiDetected: data.piiDetected,
              cost: data.cost,
              tokens: data.tokens,
            },
          ]);
        } else {
          // Check if it's a guardrail block
          if (data.action === 'blocked' && data.piiTypes) {
            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: `🚫 Guardrail Blocked Request\n\nReason: PII detected\nDetected Types: ${data.piiTypes.join(', ')}\n\nOriginal Message: ${data.originalMessage}\nRedacted Message: ${data.redactedMessage}\n\nPlease remove sensitive information and try again.`,
                piiDetected: true,
              },
            ]);
            return;
          }
          throw new Error(data.error || 'Failed to send message');
        }
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${error.message}`,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedModelData = Array.isArray(models) ? models.find((m) => m.id === selectedModel) : null;

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Top Bar - Model Selection */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-6 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <div className="flex items-center gap-4 min-w-max">
              {models.map((model) => (
                <motion.button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-4 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                    selectedModel === model.id 
                      ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/50 shadow-lg shadow-purple-500/20 text-white' 
                      : 'glass-card border border-purple-500/20 hover:border-purple-400/50 text-purple-200/70 hover:text-white'
                  }`}
                >
                  <div className="text-sm font-medium whitespace-nowrap">
                    {model.display_name}
                  </div>
                  {selectedModel === model.id && (
                    <motion.div
                      layoutId="selectedIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3 flex-shrink-0">
              <SettingsIcon className="w-5 h-5 text-purple-300/70 hover:text-white cursor-pointer transition-colors" />
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 relative z-10" style={{ paddingRight: '2rem' }}>
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center max-w-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-purple">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-semibold gradient-text mb-3">Start a conversation</h2>
                  <p className="text-purple-200/70 text-lg mb-8">
                    Select a model and ask me anything
                  </p>
                </div>
              </motion.div>
            )}
            
            {messages.map((msg, idx) => {
              // Check if this is part of a multi-model response group
              const isMultiModelResponse = msg.role === 'assistant' && msg.modelName;
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const isFirstInGroup = isMultiModelResponse && 
                (idx === 0 || prevMsg?.role === 'user' || !prevMsg?.modelName);

              if (isMultiModelResponse && isFirstInGroup) {
                // Collect all consecutive model responses
                const modelResponses = [];
                let currentIdx = idx;
                while (currentIdx < messages.length && 
                       messages[currentIdx].role === 'assistant' && 
                       messages[currentIdx].modelName) {
                  modelResponses.push(messages[currentIdx]);
                  currentIdx++;
                }

                // Only show grid if we have multiple models (multi-model mode was active)
                if (modelResponses.length > 1) {
                  return (
                    <motion.div
                      key={`group-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="mb-8"
                    >
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-purple-300/70 mb-6 px-2 flex items-center gap-3"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
                        <span className="font-medium gradient-text-cyan">Comparing {modelResponses.length} models</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 via-indigo-500/30 to-transparent"></div>
                      </motion.div>
                      <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent', paddingRight: '1rem' }}>
                        {modelResponses.map((response, responseIdx) => (
                          <motion.div
                            key={`model-${idx}-${responseIdx}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ 
                              delay: responseIdx * 0.1,
                              duration: 0.5,
                              ease: [0.23, 1, 0.32, 1],
                              type: "spring",
                              stiffness: 120
                            }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            className="flex-shrink-0 w-[380px] glass-card border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20 relative overflow-hidden group hover-lift"
                          >
                            {/* Animated gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-indigo-500/0 to-cyan-500/0 group-hover:from-purple-500/10 group-hover:via-indigo-500/5 group-hover:to-cyan-500/10 transition-all duration-500 pointer-events-none rounded-2xl"></div>
                            
                            {/* Glow effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/0 via-indigo-500/0 to-cyan-500/0 group-hover:from-purple-500/20 group-hover:via-indigo-500/10 group-hover:to-cyan-500/20 blur-xl transition-all duration-500 rounded-2xl opacity-0 group-hover:opacity-100"></div>
                            
                            <div className="relative z-10">
                              {/* Model Header */}
                              <div className="flex items-center gap-4 mb-5">
                                <motion.div 
                                  className="w-12 h-12 bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center border border-purple-400/30 shadow-lg shadow-purple-500/10"
                                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <Bot className="w-6 h-6 text-purple-300" />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold gradient-text mb-1.5 truncate">{response.modelName}</div>
                                  {response.success === false ? (
                                    <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-xs text-red-400 flex items-center gap-1.5"
                                    >
                                      <span className="text-base">⚠️</span>
                                      <span>Error occurred</span>
                                    </motion.div>
                                  ) : (
                                    <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.3 }}
                                      className="text-xs text-cyan-400 flex items-center gap-1.5"
                                    >
                                      <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                                      <span className="font-medium">Response received</span>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Response Content */}
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: responseIdx * 0.15 + 0.3 }}
                                className={`glass-card border border-purple-500/10 rounded-xl p-4 mb-4 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 ${
                                  response.success === false ? 'border-red-500/30 bg-red-900/10' : ''
                                }`}
                              >
                                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                  response.success === false ? 'text-red-300' : 'text-purple-200/90'
                                }`}>
                                  {response.content}
                                </p>
                              </motion.div>
                              
                              {/* Stats Footer */}
                              {response.tokens && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: responseIdx * 0.15 + 0.4 }}
                                  className="pt-4 border-t border-purple-500/20 flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2 text-xs text-purple-300/70">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{response.tokens.toLocaleString()} tokens</span>
                                  </div>
                                  <div className="text-xs font-semibold gradient-text-cyan">
                                    ${response.cost?.toFixed(4) || '0.0000'}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                }
              }

              // Skip if this message was already rendered as part of a group
              if (isMultiModelResponse && idx > 0 && messages[idx - 1]?.modelName) {
                return null;
              }

              // Regular single message display
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1],
                    delay: idx * 0.05
                  }}
                  className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: idx * 0.05 + 0.2, type: "spring", stiffness: 200 }}
                      className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-700 shadow-lg"
                    >
                      <Bot className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  )}
                  <motion.div 
                    initial={{ x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : ''}`}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      className={`rounded-2xl px-5 py-4 relative overflow-hidden ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white border border-gray-700 shadow-lg'
                          : 'bg-[#1a1a1a] border border-gray-800 text-gray-100 shadow-lg hover:border-green-500/50 transition-all duration-300'
                      }`}
                    >
                      {/* Shimmer effect for assistant messages */}
                      {msg.role === 'assistant' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      )}
                      
                      {msg.modelName && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                          {msg.modelName}
                        </motion.div>
                      )}
                      {msg.content.startsWith('![Generated Image](') ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 + 0.3 }}
                          className="relative z-10 mt-2"
                        >
                          <img
                            src={msg.content.match(/\((.+)\)/)?.[1] || ''}
                            alt="Generated image"
                            className="rounded-lg max-w-full h-auto shadow-lg border border-gray-700"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBsb2FkIGVycm9yPC90ZXh0Pjwvc3ZnPg==';
                            }}
                          />
                        </motion.div>
                      ) : (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 + 0.3 }}
                          className="text-sm leading-relaxed whitespace-pre-wrap relative z-10"
                        >
                          {msg.content}
                        </motion.p>
                      )}
                      {msg.piiDetected && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 + 0.4 }}
                          className="mt-3 pt-3 border-t border-purple-500/30 text-xs text-purple-300 flex items-start gap-2 bg-purple-500/10 rounded-lg px-3 py-2 border-l-2 border-l-purple-400"
                        >
                          <span className="text-base">🛡️</span>
                          <div>
                            <span className="font-semibold">Guardrail Active:</span> PII was detected and automatically redacted in your message. Sensitive information has been replaced with [TYPE REDACTED] placeholders.
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                  {msg.role === 'user' && (
                    <motion.div 
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: idx * 0.05 + 0.2, type: "spring", stiffness: 200 }}
                      className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-700 shadow-lg"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex gap-4 mb-6"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-700"
              >
                <Bot className="w-5 h-5 text-green-400" />
              </motion.div>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="bg-[#1a1a1a] border border-gray-800 rounded-2xl px-6 py-4 shadow-lg"
              >
                <div className="flex gap-2 items-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2.5 h-2.5 bg-green-400 rounded-full"
                  ></motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2.5 h-2.5 bg-green-400 rounded-full"
                  ></motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2.5 h-2.5 bg-green-400 rounded-full"
                  ></motion.div>
                  <span className="ml-3 text-xs text-gray-400">
                    {multiModelMode ? 'Querying all models...' : 'Thinking...'}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="relative z-10 px-6 py-6 bg-[#0f0f0f] border-t border-gray-800">
          {/* Action Buttons Above Input */}
          <div className="flex justify-center gap-3 mb-4">
            <motion.button
              onClick={() => {
                setMultiModelMode(!multiModelMode);
                setImageMode(false);
                setUseRAG(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 border rounded-full text-sm transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                multiModelMode
                  ? 'bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/20'
                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700'
              }`}
            >
              {multiModelMode && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ rotate: multiModelMode ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="w-4 h-4 relative z-10" />
              </motion.div>
              <span className="relative z-10 font-medium">
                Multi-Model {multiModelMode && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-green-400"
                  >
                    (Active)
                  </motion.span>
                )}
              </span>
            </motion.button>
            <motion.button
              onClick={() => {
                setUseRAG(!useRAG);
                setImageMode(false);
                setMultiModelMode(false);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 border rounded-full text-sm transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                useRAG
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20'
                  : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700'
              }`}
            >
              {useRAG && (
                <motion.div
                  layoutId="ragIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                animate={{ rotate: useRAG ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <FileText className="w-4 h-4 relative z-10" />
              </motion.div>
              <span className="relative z-10 font-medium">
                RAG {useRAG && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-blue-400"
                  >
                    (Active)
                  </motion.span>
                )}
              </span>
            </motion.button>
          </div>

          {/* Input Field */}
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative bg-[#1a1a1a] border border-gray-800 rounded-2xl px-4 py-4 flex items-end gap-3 focus-within:border-green-500 focus-within:shadow-lg focus-within:shadow-green-500/20 transition-all duration-300"
            >
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-400" />
              </motion.button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={imageMode ? "Describe the image you want to generate..." : useRAG ? "Ask a question with document context..." : "Ask me anything..."}
                className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none outline-none text-sm"
                rows={1}
                disabled={loading || (!multiModelMode && !imageMode && !selectedModel)}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Mic className="w-5 h-5 text-gray-400" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Wand2 className="w-5 h-5 text-gray-400" />
                </motion.button>
                <motion.button
                  onClick={sendMessage}
                  disabled={loading || (!multiModelMode && !imageMode && !selectedModel) || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-500/30 disabled:shadow-none"
                >
                  <motion.div
                    animate={{ rotate: loading ? 360 : 0 }}
                    transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                  >
                    {imageMode ? <ImageIcon className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  </motion.div>
                </motion.button>
              </div>
            </motion.div>

            {/* Action Buttons Below Input */}
            <div className="flex justify-center gap-3 mt-4">
              <motion.button
                onClick={() => {
                  alert('Image generation is not available at this time. This feature is coming soon.');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled
                className="px-4 py-2 border rounded-full text-sm transition-all duration-300 flex items-center gap-2 bg-gray-900 border-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                title="Image generation coming soon"
              >
                <ImageIcon className="w-4 h-4" />
                Generate Image (Coming Soon)
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
