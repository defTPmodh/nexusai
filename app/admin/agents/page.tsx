'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Agent } from '@/types';
import { Bot, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentsPage() {
  const { user } = useUser();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAgents();
    }
  }, [user]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (agent: Agent) => {
    try {
      const res = await fetch(`/api/admin/agents/${agent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !agent.is_active }),
      });

      if (res.ok) {
        await fetchAgents();
      }
    } catch (error) {
      console.error('Failed to toggle agent:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      const res = await fetch(`/api/admin/agents/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchAgents();
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold gradient-text">Agent Management</h1>
            <button className="px-5 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all glow-purple flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Agent
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          {loading ? (
            <div className="text-center py-20">
              <Loading size="md" text="Loading agents..." />
            </div>
          ) : agents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card border border-purple-500/20 rounded-xl"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-400/30">
                <Bot className="w-10 h-10 text-purple-300" />
              </div>
              <p className="text-purple-200/90 mb-2 text-lg font-medium">No agents created yet</p>
              <p className="text-purple-200/60 text-sm">Create an agent workflow to get started</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {agents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card border border-purple-500/20 rounded-xl p-5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover-lift group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 via-indigo-500/30 to-cyan-500/30 rounded-lg flex items-center justify-center border border-purple-400/30">
                        <Bot className="w-6 h-6 text-purple-300" />
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        agent.is_active
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-purple-500/10 text-purple-300/70 border border-purple-500/20'
                      }`}>
                        {agent.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <h3 className="text-white font-semibold mb-2">{agent.name}</h3>
                    {agent.description && (
                      <p className="text-sm text-purple-200/70 mb-4 line-clamp-2">{agent.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-200/50">
                        {new Date(agent.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleActive(agent)}
                          className={`p-2 rounded-lg transition-colors ${
                            agent.is_active
                              ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300'
                              : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          }`}
                        >
                          {agent.is_active ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(agent.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
