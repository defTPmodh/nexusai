'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, MessageSquare, X, Clock, Sparkles, User as UserIcon, Shield } from 'lucide-react';
import { ChatSession } from '@/types';
import Loading from '@/components/Loading';

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

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
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/98 via-purple-950/95 to-slate-950/98 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.1),transparent_50%)]" />
            <div className="absolute inset-0 border-l border-gradient-to-b from-purple-500/20 via-cyan-500/20 to-purple-500/20" />
            <div className="absolute inset-0 border-l border-transparent bg-gradient-to-b from-purple-500/20 via-transparent to-purple-500/20" style={{ maskImage: 'linear-gradient(to right, black 0px, black 1px, transparent 1px)' }} />
            
            <div className="relative flex flex-col h-full">
            {/* Header with gradient */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative p-6 border-b border-transparent bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"
              style={{
                borderImage: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.3), transparent) 1',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-cyan-500/5 to-purple-500/5" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="flex items-center gap-3"
                  >
                    <div className="relative w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-purple-500/20" />
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                      <div className="absolute inset-0 border border-white/10" />
                      <History className="relative w-5 h-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-cyan-300 to-purple-300">
                        Chat History
                      </h2>
                      <p className="text-xs text-white/60 mt-0.5">
                        {sessions.length} {sessions.length === 1 ? 'chat' : 'chats'}
                      </p>
                    </div>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/50" />
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
                      <div className="relative flex items-center gap-2 p-1 rounded-lg border border-transparent bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-purple-500/10 backdrop-blur-sm">
                        <div className="absolute inset-0 bg-white/5 rounded-lg" />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setViewMode('all')}
                          className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all z-10 ${
                            viewMode === 'all'
                              ? 'text-white'
                              : 'text-white/60 hover:text-white/80'
                          }`}
                        >
                          {viewMode === 'all' && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-purple-500/30 rounded-md border border-purple-500/30"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <Shield className="w-3 h-3" />
                            All Chats
                          </span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setViewMode('own')}
                          className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all z-10 ${
                            viewMode === 'own'
                              ? 'text-white'
                              : 'text-white/60 hover:text-white/80'
                          }`}
                        >
                          {viewMode === 'own' && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-purple-500/30 rounded-md border border-purple-500/30"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <UserIcon className="w-3 h-3" />
                            My Chats
                          </span>
                        </motion.button>
                      </div>
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
                  <Loading size="md" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="relative w-16 h-16 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-purple-500/20" />
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                    <div className="absolute inset-0 border border-white/10" />
                    <MessageSquare className="relative w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400/50 to-cyan-400/50" />
                  </div>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 text-sm mb-1 font-medium">
                    No chat history yet
                  </p>
                  <p className="text-white/50 text-xs">
                    Start a new conversation to see it here
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {sessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ 
                        delay: index * 0.02,
                        duration: 0.2,
                        layout: { duration: 0.2 }
                      }}
                      whileHover={{ y: -1 }}
                      onClick={() => {
                        onSelectSession(session.id);
                        onClose();
                      }}
                      className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                        currentSessionId === session.id
                          ? 'border border-purple-500/40'
                          : 'border border-transparent hover:border-purple-500/30'
                      }`}
                      style={{
                        background: currentSessionId === session.id
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))'
                          : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(6, 182, 212, 0.05))',
                      }}
                    >
                      {/* Gradient border glow effect */}
                      {currentSessionId === session.id && (
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 blur-sm -z-10" />
                      )}
                      <div className="absolute inset-0 bg-slate-950/60 rounded-lg backdrop-blur-sm -z-10" />

                      <div className="relative z-10">
                        {/* Title */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-sm font-medium truncate flex-1">
                            {session.title ? (
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-cyan-200 to-purple-200">
                                {session.title}
                              </span>
                            ) : (
                              <span className="text-white/50 italic">New Chat</span>
                            )}
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handleDelete(session.id, e)}
                            disabled={deletingId === session.id}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          >
                            {deletingId === session.id ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full"
                              />
                            ) : (
                              <Trash2 className="w-4 h-4 text-white/50" />
                            )}
                          </motion.button>
                        </div>

                        {/* Preview */}
                        {session.preview && (
                          <p className="text-xs text-white/50 mb-3 line-clamp-2">
                            {session.preview}
                          </p>
                        )}

                        {/* User Info (for admin viewing all chats) */}
                        {isAdmin && viewMode === 'all' && !session.is_own_session && (
                          <div className="mb-3 px-2.5 py-1.5 rounded-md border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-3.5 h-3.5 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400" />
                              <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300 font-medium">
                                {session.user_name || session.user_email || 'Unknown User'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(session.updated_at)}</span>
                          </div>
                          {session.message_count > 0 && (
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-3 h-3" />
                              <span>{session.message_count} {session.message_count === 1 ? 'msg' : 'msgs'}</span>
                            </div>
                          )}
                          {session.model_name && (
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3" />
                              <span className="truncate max-w-[100px]">{session.model_name}</span>
                            </div>
                          )}
                        </div>
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

