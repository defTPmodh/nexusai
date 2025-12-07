'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, MessageSquare, X, Clock, Sparkles, User as UserIcon, Shield } from 'lucide-react';
import { ChatSession } from '@/types';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  currentSessionId: string | null;
}

interface SessionWithDetails extends ChatSession {
  message_count: number;
  preview: string | null;
  model_name: string | null;
  user_email?: string | null;
  user_name?: string | null;
  is_own_session?: boolean;
}

export default function ChatHistory({
  isOpen,
  onClose,
  onSelectSession,
  currentSessionId,
}: ChatHistoryProps) {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'own'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, viewMode]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat/sessions');
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin || false);
        const allSessions = data.sessions || [];
        // Filter based on view mode if admin
        if (data.isAdmin && viewMode === 'own') {
          setSessions(allSessions.filter((s: SessionWithDetails) => s.is_own_session));
        } else {
          setSessions(allSessions);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;

    setDeletingId(sessionId);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          onSelectSession('');
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with animated gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15), transparent 50%)',
                  'radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.15), transparent 50%)',
                  'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15), transparent 50%)',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              mass: 0.8
            }}
            className="fixed right-0 top-0 h-full w-96 z-50 flex flex-col overflow-hidden"
          >
            {/* Animated background layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/60 to-black" />
            <motion.div
              className="absolute inset-0 border-l border-purple-500/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-cyan-500/5"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-0 shadow-2xl shadow-purple-500/20" />
            
            <div className="relative flex flex-col h-full backdrop-blur-xl">
            {/* Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="relative p-6 border-b border-purple-500/20 overflow-hidden"
            >
              {/* Animated header background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-indigo-900/40 to-purple-900/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.2), transparent 70%)',
                    'radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.2), transparent 70%)',
                    'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.2), transparent 70%)',
                  ],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="absolute inset-0 backdrop-blur-xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="relative"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-50"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.7, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <History className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                    <div>
                      <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-cyan-100 bg-clip-text text-transparent"
                      >
                        Chat History
                      </motion.h2>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xs text-purple-300/80 flex items-center gap-1.5 mt-0.5"
                      >
                        <motion.span
                          key={sessions.length}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="inline-block"
                        >
                          {sessions.length}
                        </motion.span>
                        <span>{sessions.length === 1 ? 'chat' : 'chats'}</span>
                      </motion.p>
                    </div>
                  </motion.div>
                  <motion.button
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    whileHover={{ 
                      scale: 1.15, 
                      rotate: 90,
                      backgroundColor: 'rgba(139, 92, 246, 0.2)'
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2.5 rounded-xl transition-all relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.3 }}
                    />
                    <X className="w-5 h-5 text-purple-300 relative z-10" />
                  </motion.button>
                </div>
                
                {/* Admin View Toggle */}
                <AnimatePresence>
                  {isAdmin && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="flex items-center gap-2 overflow-hidden"
                    >
                      <motion.div
                        className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-purple-500/20 backdrop-blur-sm"
                        layout
                      >
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewMode('all')}
                          className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-all overflow-hidden ${
                            viewMode === 'all'
                              ? 'text-white'
                              : 'text-purple-300/70 hover:text-purple-200'
                          }`}
                        >
                          {viewMode === 'all' && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-cyan-500/40 rounded-lg border border-purple-400/50 shadow-lg shadow-purple-500/30"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            All Chats
                          </span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewMode('own')}
                          className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-all overflow-hidden ${
                            viewMode === 'own'
                              ? 'text-white'
                              : 'text-purple-300/70 hover:text-purple-200'
                          }`}
                        >
                          {viewMode === 'own' && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-purple-500/40 via-indigo-500/40 to-cyan-500/40 rounded-lg border border-purple-400/50 shadow-lg shadow-purple-500/30"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5" />
                            My Chats
                          </span>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent' }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <motion.div
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full"
                    />
                  </motion.div>
                </div>
              ) : sessions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center justify-center h-64 text-center px-4"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/30"
                  >
                    <MessageSquare className="w-10 h-10 text-purple-300/50" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-purple-300/80 text-sm mb-1 font-medium"
                  >
                    No chat history yet
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-purple-400/60 text-xs"
                  >
                    Start a new conversation to see it here
                  </motion.p>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, x: 30, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ 
                        opacity: 0, 
                        x: -30, 
                        scale: 0.8,
                        transition: { duration: 0.2 }
                      }}
                      transition={{ 
                        delay: index * 0.03,
                        type: 'spring', 
                        stiffness: 400, 
                        damping: 25,
                        layout: { duration: 0.3 }
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                        currentSessionId === session.id
                          ? 'bg-gradient-to-br from-purple-500/40 via-indigo-500/30 to-purple-500/20 border-purple-400/60 shadow-xl shadow-purple-500/30'
                          : 'bg-white/5 border-purple-500/20 hover:bg-white/10 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10'
                      }`}
                    >
                      {/* Animated background gradient */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-cyan-500/0 to-purple-500/0 rounded-2xl"
                        animate={{
                          background: currentSessionId === session.id
                            ? [
                                'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(139, 92, 246, 0.2) 100%)',
                                'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.2) 100%)',
                                'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(139, 92, 246, 0.2) 100%)',
                              ]
                            : [
                                'linear-gradient(135deg, rgba(139, 92, 246, 0) 0%, rgba(6, 182, 212, 0) 50%, rgba(139, 92, 246, 0) 100%)',
                                'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 50%, rgba(139, 92, 246, 0.1) 100%)',
                                'linear-gradient(135deg, rgba(139, 92, 246, 0) 0%, rgba(6, 182, 212, 0) 50%, rgba(139, 92, 246, 0) 100%)',
                              ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: 'easeInOut',
                        }}
                      />
                      
                      {/* Glow effect */}
                      {currentSessionId === session.id && (
                        <motion.div
                          className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl"
                          animate={{
                            opacity: [0.5, 0.8, 0.5],
                            scale: [1, 1.05, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}

                      <div className="relative z-10">
                        {/* Title */}
                        <div className="flex items-start justify-between mb-3">
                          <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 + 0.1 }}
                            className="text-sm font-bold text-white truncate flex-1 leading-tight"
                          >
                            {session.title || (
                              <span className="text-purple-300/60 italic">New Chat</span>
                            )}
                          </motion.h3>
                          <motion.button
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.03 + 0.15, type: 'spring' }}
                            whileHover={{ 
                              scale: 1.2, 
                              rotate: [0, -10, 10, 0],
                              backgroundColor: 'rgba(239, 68, 68, 0.2)'
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleDelete(session.id, e)}
                            disabled={deletingId === session.id}
                            className="p-2 hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 relative overflow-hidden"
                          >
                            {deletingId === session.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                              />
                            ) : (
                              <>
                                <motion.div
                                  className="absolute inset-0 bg-red-500/20 rounded-xl"
                                  whileHover={{ scale: 1.5, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                />
                                <Trash2 className="w-4 h-4 text-red-400 relative z-10" />
                              </>
                            )}
                          </motion.button>
                        </div>

                        {/* Preview */}
                        {session.preview && (
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 + 0.2 }}
                            className="text-xs text-purple-300/70 mb-3 line-clamp-2 leading-relaxed"
                          >
                            {session.preview}
                          </motion.p>
                        )}

                        {/* User Info (for admin viewing all chats) */}
                        <AnimatePresence>
                          {isAdmin && viewMode === 'all' && !session.is_own_session && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-3 px-3 py-2 bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-cyan-500/15 border border-purple-400/30 rounded-xl backdrop-blur-sm overflow-hidden"
                            >
                              <motion.div
                                className="flex items-center gap-2"
                                initial={{ x: -10 }}
                                animate={{ x: 0 }}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.1, rotate: 360 }}
                                  transition={{ duration: 0.5 }}
                                  className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-purple-400/50 flex items-center justify-center"
                                >
                                  <UserIcon className="w-3 h-3 text-purple-300" />
                                </motion.div>
                                <p className="text-xs text-purple-200/90 font-medium">
                                  {session.user_name || session.user_email || 'Unknown User'}
                                </p>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Metadata */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 + 0.25 }}
                          className="flex items-center gap-3 text-xs text-purple-400/80 flex-wrap"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-purple-500/20"
                          >
                            <Clock className="w-3.5 h-3.5 text-purple-300" />
                            <span className="font-medium">{formatDate(session.updated_at)}</span>
                          </motion.div>
                          {session.message_count > 0 && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-purple-500/20"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
                              <span className="font-medium">{session.message_count} {session.message_count === 1 ? 'msg' : 'msgs'}</span>
                            </motion.div>
                          )}
                          {session.model_name && (
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-purple-500/20"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                              <span className="font-medium truncate max-w-[100px]">{session.model_name}</span>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

