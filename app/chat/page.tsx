'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LLMModel } from '@/types';
import { Send, Bot, User, Sparkles, Bookmark, Star, Settings as SettingsIcon, Wand2, Mic, Globe, Image as ImageIcon, Rocket, FileText, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to render formatted message content
function renderMessageContent(content: string): React.ReactElement {
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```') || line.match(/^ {4,}/)) {
      elements.push(
        React.createElement('pre', { key: idx, className: 'bg-gray-800/50 rounded p-2 my-2 overflow-x-auto text-xs font-mono' },
          React.createElement('code', null, line.replace(/^```/, '').replace(/```$/, ''))
        )
      );
      return;
    }
    
    if (line.trim().match(/^[-*+]\s/)) {
      elements.push(
        React.createElement('li', { key: idx, className: 'ml-4 list-disc' }, line.replace(/^[-*+]\s/, ''))
      );
      return;
    }
    
    if (line.trim().match(/^\d+\.\s/)) {
      elements.push(
        React.createElement('li', { key: idx, className: 'ml-4 list-decimal' }, line.replace(/^\d+\.\s/, ''))
      );
      return;
    }
    
    const boldRegex = /\*\*(.+?)\*\*/g;
    if (boldRegex.test(line)) {
      const parts: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let match;
      boldRegex.lastIndex = 0;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(React.createElement('strong', { key: match.index, className: 'font-semibold' }, match[1]));
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      elements.push(React.createElement('p', { key: idx }, parts));
      return;
    }
    
    if (line.trim()) {
      elements.push(React.createElement('p', { key: idx, className: 'mb-2' }, line));
    } else {
      elements.push(React.createElement('br', { key: idx }));
    }
  });
  
  return React.createElement('div', null, elements);
}

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
  // Track messages per model for multi-model column view
  const [modelMessages, setModelMessages] = useState<Record<string, Array<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    piiDetected?: boolean; 
    cost?: number; 
    tokens?: number;
    modelName?: string;
    success?: boolean;
  }>>>({});
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; display_name: string }>>([]);
  const [enabledModels, setEnabledModels] = useState<Set<string>>(new Set()); // Models enabled for multi-chat
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [multiModelMode, setMultiModelMode] = useState(false);
  const [useRAG, setUseRAG] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const quickPrompts = [
    'Summarize the latest industry news in AI and ML.',
    'Generate a concise project kickoff brief with milestones.',
    'Draft a helpful onboarding message for a new teammate.',
    'Create a customer-friendly explanation of our product in two paragraphs.',
  ];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchModels();
    }
  }, [user]);

  useEffect(() => {
    if (!multiModelMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, multiModelMode]);

  // Scroll each column to bottom when new messages arrive in multi-model mode
  useEffect(() => {
    if (multiModelMode) {
      Object.keys(columnRefs.current).forEach((modelId) => {
        const column = columnRefs.current[modelId];
        if (column) {
          column.scrollTop = column.scrollHeight;
        }
      });
    }
  }, [modelMessages, multiModelMode]);

  // Enable shift+scroll for horizontal scrolling in multi-model mode
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !multiModelMode) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [multiModelMode]);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models');
      if (!res.ok) {
        console.error('Failed to fetch models:', res.statusText);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        // Sort models to put Gemini first for better visibility
        const sortedModels = [...data].sort((a, b) => {
          const aIsGemini = a.provider === 'google' && a.model_name.includes('gemini');
          const bIsGemini = b.provider === 'google' && b.model_name.includes('gemini');
          if (aIsGemini && !bIsGemini) return -1;
          if (!aIsGemini && bIsGemini) return 1;
          return 0;
        });
        setModels(sortedModels);
        if (sortedModels.length > 0) {
          // Select Gemini by default if available, otherwise first model
          const geminiModel = sortedModels.find((m: LLMModel) => m.provider === 'google' && m.model_name.includes('gemini'));
          setSelectedModel(geminiModel?.id || sortedModels[0].id);
          // Enable Gemini and first 2 other models by default for multi-chat
          const defaultEnabled = new Set<string>();
          if (geminiModel) {
            defaultEnabled.add(geminiModel.id);
          }
          sortedModels.filter((m: LLMModel) => m.id !== geminiModel?.id).slice(0, 2).forEach((m: LLMModel) => {
            defaultEnabled.add(m.id);
          });
          setEnabledModels(defaultEnabled);
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

  const toggleModel = (modelId: string) => {
    setEnabledModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelId)) {
        newSet.delete(modelId);
      } else {
        newSet.add(modelId);
      }
      return newSet;
    });
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
    
    // In multi-model mode, add user message to all enabled model columns immediately
    if (multiModelMode) {
      setModelMessages((prev) => {
        const updated = { ...prev };
        enabledModels.forEach((modelId) => {
          if (updated[modelId]) {
            updated[modelId] = [...updated[modelId], newMessage];
          } else {
            // Initialize column with user message
            updated[modelId] = [newMessage];
          }
        });
        return updated;
      });
    }

    try {
      if (multiModelMode) {
        // Multi-model comparison mode - only query enabled models
        if (enabledModels.size === 0) {
          alert('Please enable at least one model for multi-chat');
          setLoading(false);
          return;
        }
        
        const res = await fetch('/api/chat/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage,
            modelIds: Array.from(enabledModels), // Send enabled model IDs
          }),
        });

        const data = await res.json();

        if (res.ok) {
          // Store available models for column display
          const modelIds = new Set<string>();
          const modelInfoList: Array<{ id: string; display_name: string }> = [];
          
          // Process results and organize by model
          data.results.forEach((result: any) => {
            const model = models.find(m => m.display_name === result.modelName);
            if (model) {
              modelIds.add(model.id);
              modelInfoList.push({ id: model.id, display_name: result.modelName });
            }
          });
          
          // Add all model responses and organize by model
          data.results.forEach((result: any) => {
            // Find model ID from display name
            const model = models.find(m => m.display_name === result.modelName);
            if (model) {
              // Update model-specific messages
              setModelMessages((prev) => {
                const currentMessages = prev[model.id] || [newMessage];
                const updatedMessages = [...currentMessages];
                // Add assistant response (user message should already be added)
                updatedMessages.push({
                  role: 'assistant',
                  content: result.content,
                  piiDetected: data.piiDetected,
                  cost: result.cost,
                  tokens: result.inputTokens + result.outputTokens,
                  modelName: result.modelName,
                  success: result.success,
                });
                return {
                  ...prev,
                  [model.id]: updatedMessages,
                };
              });
            }
            
            // Also add to regular messages for backward compatibility
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

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const displayName = user?.name || user?.email || 'Guest';

  return (
    <div className="h-screen flex overflow-hidden bg-slate-950">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col relative overflow-hidden">
        {/* Modern layered background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_70%_70%,rgba(14,165,233,0.12),transparent_32%)] blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/60"></div>

        {/* Top Bar - Model Selection */}
        <div className="relative z-10 glass-dark border-b border-white/5 px-6 py-4">
          {multiModelMode ? (
            <div className="flex items-center gap-3 overflow-x-auto">
              <div className="flex items-center gap-3 min-w-max">
                {models.map((model) => {
                  const isEnabled = enabledModels.has(model.id);
                  const isGemini = model.provider === 'google' && model.model_name.includes('gemini');
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => toggleModel(model.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-2.5 ${
                        isEnabled
                          ? isGemini
                            ? 'bg-gradient-to-r from-blue-500/25 to-cyan-500/25 border border-blue-400/30 shadow-md shadow-blue-500/10 text-white font-medium backdrop-blur-sm'
                            : 'bg-gradient-to-r from-white/10 to-white/5 border border-white/10 shadow-sm text-white/90 font-medium backdrop-blur-sm'
                          : isGemini
                            ? 'glass-card border border-blue-500/20 hover:border-blue-400/30 text-blue-200/80 hover:text-blue-100 font-normal bg-gradient-to-r from-blue-500/8 to-cyan-500/8 opacity-80'
                            : 'glass-card border border-white/8 hover:border-white/12 text-white/60 hover:text-white/80 font-normal opacity-70'
                      }`}
                    >
                      {isGemini && (
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-blue-400/80 shadow-sm' : 'bg-blue-500/40'}`}
                        />
                      )}
                      <div className={`text-sm whitespace-nowrap ${isGemini ? 'font-medium' : 'font-normal'}`}>
                        {model.display_name}
                      </div>
                      {!isGemini && (
                        <div className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-white/60' : 'bg-white/30'}`} />
                      )}
                      {isEnabled && (
                        <motion.div
                          layoutId={`toggle-${model.id}`}
                          className={`absolute inset-0 rounded-xl -z-10 ${
                            isGemini
                              ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
                              : 'bg-gradient-to-r from-white/5 to-white/3'
                          }`}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 overflow-x-auto">
              <div className="flex items-center gap-4 min-w-max">
                {models.map((model) => {
                  const isGemini = model.provider === 'google' && model.model_name.includes('gemini');
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-2.5 ${
                        selectedModel === model.id 
                          ? isGemini
                            ? 'bg-gradient-to-r from-blue-500/25 to-cyan-500/25 border border-blue-400/30 shadow-md shadow-blue-500/10 text-white font-medium backdrop-blur-sm'
                            : 'bg-gradient-to-r from-white/10 to-white/5 border border-white/10 shadow-sm text-white/90 font-medium backdrop-blur-sm'
                          : isGemini
                            ? 'glass-card border border-blue-500/20 hover:border-blue-400/30 text-blue-200/80 hover:text-blue-100 font-normal bg-gradient-to-r from-blue-500/8 to-cyan-500/8'
                            : 'glass-card border border-white/8 hover:border-white/12 text-white/60 hover:text-white/80 font-normal'
                      }`}
                    >
                      {isGemini && (
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1.5 h-1.5 rounded-full bg-blue-400/80 shadow-sm"
                        />
                      )}
                      <div className={`text-sm whitespace-nowrap ${isGemini ? 'font-medium' : 'font-normal'}`}>
                        {model.display_name}
                      </div>
                      {selectedModel === model.id && (
                        <motion.div
                          layoutId="selectedIndicator"
                          className={`absolute inset-0 rounded-xl -z-10 ${
                            isGemini
                              ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
                              : 'bg-gradient-to-r from-white/5 to-white/3'
                          }`}
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <div className="ml-auto flex items-center gap-3 flex-shrink-0">
                <SettingsIcon className="w-5 h-5 text-white/50 hover:text-white/80 cursor-pointer transition-colors duration-300" />
                <div className="w-8 h-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <User className="w-4 h-4 text-white/70" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hero + status panel */}
        <div className="relative z-10 px-6 pt-5 pb-4 flex flex-wrap gap-4 items-stretch">
          <div className="flex-1 min-w-[260px] glass-card border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-lg shadow-emerald-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/40 via-cyan-400/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-white/60">Welcome back</p>
                <p className="text-lg font-semibold text-white">{displayName}</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Craft thoughtful prompts, compare multiple models, and switch into RAG or image generation without leaving the flow.
            </p>
            <div className="flex gap-2 mt-4 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/70 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Modernized chat canvas
              </span>
              <span className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/70 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Adaptive modes
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-[240px] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-start gap-3 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-cyan-500/5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Rocket className="w-5 h-5 text-emerald-200" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Session status</p>
                <p className="text-xs text-white/60 mt-1">{sessionId ? 'Conversation in progress' : 'Ready for a fresh start'}</p>
              </div>
            </div>
            <div className="glass-card border border-white/10 rounded-2xl p-4 flex items-start gap-3 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-indigo-500/5">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-blue-200" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Active mode</p>
                <p className="text-xs text-white/60 mt-1">
                  {multiModelMode ? 'Comparing enabled models side by side' : imageMode ? 'Designing visuals with Image mode' : useRAG ? 'RAG with document context' : 'Single model conversation'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area - Column Layout for Multi-Model Mode */}
        {multiModelMode ? (
          <div className="flex-1 relative z-10" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {enabledModels.size === 0 ? (
              // Empty state for multi-model mode
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-2xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-semibold text-white mb-3">Multi-Model Comparison</h2>
                  <p className="text-green-200/70 text-lg mb-8">
                    Enable models above, then send a message to see responses side-by-side
                  </p>
                </div>
              </div>
            ) : (
              <div 
                ref={scrollContainerRef}
                className="h-full w-full multi-model-scroll" 
                style={{ 
                  overflowX: 'scroll', 
                  overflowY: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  position: 'relative'
                }}
              >
                <div 
                  className="flex h-full gap-4 px-4 py-4"
                  style={{ 
                    width: `${Array.from(enabledModels).length * 440}px`,
                    minWidth: `${Array.from(enabledModels).length * 440}px`,
                    paddingRight: '2rem',
                    flexShrink: 0,
                    display: 'flex',
                    boxSizing: 'border-box'
                  }}
                >
                  {Array.from(enabledModels).map((modelId, idx) => {
                  const columnMessages = modelMessages[modelId] || [];
                  const model = models.find(m => m.id === modelId);
                  if (!model) return null;
                  
                  return (
                    <motion.div
                      key={modelId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex-shrink-0 h-full flex flex-col glass-card border border-white/8 rounded-2xl overflow-hidden hover:border-white/12 transition-all duration-300"
                      style={{ width: '420px', minWidth: '420px', maxWidth: '420px', flexShrink: 0, flexGrow: 0, boxSizing: 'border-box' }}
                    >
                      {/* Column Header */}
                      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 bg-gradient-to-r from-white/5 to-white/3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-white/10 via-white/8 to-white/5 rounded-xl flex items-center justify-center border border-white/8 backdrop-blur-sm">
                            <Bot className="w-5 h-5 text-white/70" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white/90 truncate">{model.display_name}</div>
                            <div className="text-xs text-white/50">
                              {model.provider || 'Unknown'}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Scrollable Messages Container */}
                      <div 
                        ref={(el) => { columnRefs.current[modelId] = el; }}
                        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent' }}
                      >
                        {columnMessages.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Bot className="w-8 h-8 text-green-300/50" />
                              </div>
                              <p className="text-green-200/50 text-sm">Waiting for response...</p>
                            </div>
                          </div>
                        ) : (
                          <AnimatePresence>
                            {columnMessages.map((msg, msgIdx) => (
                              <motion.div
                                key={msgIdx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: msgIdx * 0.05 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                {msg.role === 'assistant' && (
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0 border border-green-400/30">
                                    <Bot className="w-4 h-4 text-green-300" />
                                  </div>
                                )}
                                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                                  <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className={`rounded-xl px-4 py-3 ${
                                      msg.role === 'user'
                                        ? 'bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-sky-500/10 text-white border border-emerald-400/30 shadow-[0_10px_40px_-20px_rgba(16,185,129,0.6)] backdrop-blur'
                                        : 'bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-emerald-900/30 border border-emerald-500/20 text-green-100/90 shadow-[0_10px_40px_-24px_rgba(16,185,129,0.7)] backdrop-blur'
                                    }`}
                                  >
                                    {msg.content.startsWith('![Generated Image](') ? (
                                      (() => {
                                        const imageUrl = msg.content.match(/\((.+)\)/)?.[1];
                                        if (!imageUrl) return null;
                                        return (
                                          <Image
                                            src={imageUrl}
                                            alt="Generated"
                                            width={800}
                                            height={600}
                                            className="rounded-lg max-w-full h-auto"
                                          />
                                        );
                                      })()
                                    ) : (
                                      <div className="text-sm leading-relaxed">
                                        {renderMessageContent(msg.content)}
                                      </div>
                                    )}
                                    {msg.piiDetected && (
                                      <div className="mt-2 pt-2 border-t border-green-500/30 text-xs text-green-300 flex items-start gap-2">
                                        <span>🛡️</span>
                                        <span>PII detected and redacted</span>
                                      </div>
                                    )}
                                  </motion.div>
                                  {msg.role === 'assistant' && msg.tokens && (
                                    <div className="mt-2 flex items-center justify-between text-xs text-green-300/70 px-1">
                                      <div className="flex items-center gap-1.5">
                                        <Sparkles className="w-3 h-3" />
                                        <span>{msg.tokens.toLocaleString()} tokens</span>
                                      </div>
                                      {msg.cost !== undefined && (
                                        <span className="font-semibold text-green-400">
                                          ${msg.cost.toFixed(4)}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {msg.role === 'user' && (
                                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500/40 via-cyan-500/30 to-slate-900/80 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-300/40 shadow-sm">
                                    <User className="w-4 h-4 text-white/80" />
                                  </div>
                                )}
                              </motion.div>
                            ))}
                            {loading && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3 justify-start"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-full flex items-center justify-center flex-shrink-0 border border-green-400/30">
                                  <Bot className="w-4 h-4 text-green-300" />
                                </div>
                                <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-xl px-4 py-3">
                                  <div className="flex gap-2 items-center">
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                      className="w-2 h-2 bg-green-400 rounded-full"
                                    />
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                      className="w-2 h-2 bg-green-400 rounded-full"
                                    />
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1] }}
                                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                      className="w-2 h-2 bg-green-400 rounded-full"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    </motion.div>
                  );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Regular single-model view
          <div className="flex-1 overflow-y-auto px-6 py-8 relative z-10" style={{ paddingRight: '2rem' }}>
            <AnimatePresence>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center max-w-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-semibold text-white mb-3">Start a conversation</h2>
                    <p className="text-green-200/70 text-lg mb-8">
                      Select a model and ask me anything
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {quickPrompts.map((prompt) => (
                        <motion.button
                          key={prompt}
                          whileHover={{ y: -3, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickPrompt(prompt)}
                          className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/80 hover:border-white/20 hover:text-white/100 transition-colors duration-200 shadow-sm backdrop-blur"
                        >
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
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
                        className="text-xs text-green-300/70 mb-6 px-2 flex items-center gap-3"
                      >
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                        <span className="font-medium text-green-400">Comparing {modelResponses.length} models</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-transparent"></div>
                      </motion.div>
                      <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent', paddingRight: '1rem' }}>
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
                            className="flex-shrink-0 w-[380px] glass-card border border-green-500/20 rounded-2xl p-6 hover:border-green-400/50 transition-all duration-300 shadow-lg hover:shadow-green-500/20 relative overflow-hidden group hover-lift"
                          >
                            {/* Animated gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-emerald-500/0 to-teal-500/0 group-hover:from-green-500/10 group-hover:via-emerald-500/5 group-hover:to-teal-500/10 transition-all duration-500 pointer-events-none rounded-2xl"></div>
                            
                            {/* Glow effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/0 via-emerald-500/0 to-teal-500/0 group-hover:from-green-500/20 group-hover:via-emerald-500/10 group-hover:to-teal-500/20 blur-xl transition-all duration-500 rounded-2xl opacity-0 group-hover:opacity-100"></div>
                            
                            <div className="relative z-10">
                              {/* Model Header */}
                              <div className="flex items-center gap-4 mb-5">
                                <motion.div 
                                  className="w-12 h-12 bg-gradient-to-br from-green-500/30 via-emerald-500/30 to-teal-500/30 rounded-xl flex items-center justify-center border border-green-400/30 shadow-lg shadow-green-500/10"
                                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <Bot className="w-6 h-6 text-green-300" />
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-white mb-1.5 truncate">{response.modelName}</div>
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
                                      className="text-xs text-green-400 flex items-center gap-1.5"
                                    >
                                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full shadow-lg shadow-green-400/50"></div>
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
                                className={`glass-card border border-green-500/10 rounded-xl p-4 mb-4 bg-gradient-to-br from-green-900/10 to-emerald-900/10 ${
                                  response.success === false ? 'border-red-500/30 bg-red-900/10' : ''
                                }`}
                              >
                                <div className={`text-sm leading-relaxed ${
                                  response.success === false ? 'text-red-300' : 'text-green-100/90'
                                }`}>
                                  {renderMessageContent(response.content)}
                                </div>
                              </motion.div>
                              
                              {/* Stats Footer */}
                              {response.tokens && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: responseIdx * 0.15 + 0.4 }}
                                  className="pt-4 border-t border-green-500/20 flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2 text-xs text-green-300/70">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>{response.tokens.toLocaleString()} tokens</span>
                                  </div>
                                  <div className="text-xs font-semibold text-green-400">
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
                      className="w-10 h-10 bg-gradient-to-br from-emerald-500/40 via-cyan-500/30 to-slate-900/80 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-300/40 shadow-lg"
                    >
                      <Bot className="w-5 h-5 text-white/80" />
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
                          ? 'bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-sky-500/10 text-white border border-emerald-400/30 shadow-[0_10px_50px_-22px_rgba(16,185,129,0.7)] backdrop-blur'
                          : 'bg-gradient-to-br from-slate-950/90 via-slate-900/70 to-emerald-900/30 border border-emerald-500/25 text-gray-100 shadow-[0_10px_45px_-26px_rgba(16,185,129,0.65)] hover:border-emerald-400/50 transition-all duration-300 backdrop-blur'
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
                          {(() => {
                            const imageUrl = msg.content.match(/\((.+)\)/)?.[1];
                            if (!imageUrl) return null;
                            return (
                              <Image
                                src={imageUrl}
                                alt="Generated image"
                                width={1024}
                                height={768}
                                className="rounded-lg max-w-full h-auto shadow-lg border border-gray-700"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.src =
                                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBsb2FkIGVycm9yPC90ZXh0Pjwvc3ZnPg==';
                                }}
                              />
                            );
                          })()}
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 + 0.3 }}
                          className="text-sm leading-relaxed relative z-10"
                        >
                          {renderMessageContent(msg.content)}
                        </motion.div>
                      )}
                      {msg.piiDetected && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 + 0.4 }}
                          className="mt-3 pt-3 border-t border-green-500/30 text-xs text-green-300 flex items-start gap-2 bg-green-500/10 rounded-lg px-3 py-2 border-l-2 border-l-green-400"
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
                      className="w-10 h-10 bg-gradient-to-br from-emerald-500/40 via-cyan-500/30 to-slate-900/80 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-300/40 shadow-lg"
                    >
                      <User className="w-5 h-5 text-white/80" />
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
                className="w-10 h-10 bg-gradient-to-br from-emerald-500/40 via-cyan-500/30 to-slate-900/80 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-300/40"
              >
                <Bot className="w-5 h-5 text-green-400" />
              </motion.div>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-emerald-900/30 border border-emerald-500/25 rounded-2xl px-6 py-4 shadow-lg"
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
        )}

        {/* Chat Input Area */}
        <div className="relative z-10 px-6 py-6 bg-[#0f0f0f] border-t border-gray-800">
          {/* Action Buttons Above Input */}
          <div className="flex justify-center gap-3 mb-4">
            <motion.button
              onClick={() => {
                const newMode = !multiModelMode;
                setMultiModelMode(newMode);
                setImageMode(false);
                setUseRAG(false);
                // Clear model messages when disabling multi-model mode
                if (!newMode) {
                  setModelMessages({});
                  setAvailableModels([]);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2.5 border rounded-full text-sm transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                multiModelMode
                  ? 'bg-white/10 border-white/20 text-white/90 shadow-sm backdrop-blur-sm'
                  : 'glass-card border-white/8 text-white/60 hover:bg-white/5 hover:border-white/12 hover:text-white/80'
              }`}
            >
              {multiModelMode && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"
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
                    className="text-white/70"
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
                  ? 'bg-white/10 border-white/20 text-white/90 shadow-sm backdrop-blur-sm'
                  : 'glass-card border-white/8 text-white/60 hover:bg-white/5 hover:border-white/12 hover:text-white/80'
              }`}
            >
              {useRAG && (
                <motion.div
                  layoutId="ragIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"
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
                    className="text-white/70"
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
              className="relative glass-card border border-white/8 rounded-2xl px-4 py-4 flex items-end gap-3 focus-within:border-white/15 focus-within:shadow-md focus-within:shadow-white/5 transition-all duration-300"
            >
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
              >
                <Plus className="w-5 h-5 text-white/50 hover:text-white/80" />
              </motion.button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={imageMode ? "Describe the image you want to generate..." : useRAG ? "Ask a question with document context..." : "Ask me anything..."}
                className="flex-1 bg-transparent text-white/90 placeholder-white/40 resize-none outline-none text-sm"
                rows={1}
                disabled={loading || (!multiModelMode && !imageMode && !selectedModel)}
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
                >
                  <Mic className="w-5 h-5 text-white/50 hover:text-white/80" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
                >
                  <Wand2 className="w-5 h-5 text-white/50 hover:text-white/80" />
                </motion.button>
                <motion.button
                  onClick={sendMessage}
                  disabled={loading || (!multiModelMode && !imageMode && !selectedModel) || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 bg-gradient-to-r from-white/15 to-white/10 text-white rounded-lg hover:from-white/20 hover:to-white/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm shadow-white/5 disabled:shadow-none border border-white/10 hover:border-white/15 backdrop-blur-sm"
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
