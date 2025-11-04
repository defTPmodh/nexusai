'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Search, ChevronRight, Settings, Sparkles, Plus, Zap, History, FileText, BarChart3, Bot, X, Users, CreditCard, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentChatsOpen, setRecentChatsOpen] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 25000, plan: 'free', unlimited: false });
  const [team, setTeam] = useState<any>(null);

  useEffect(() => {
    // Fetch usage data and team info
    const fetchData = async () => {
      try {
        const usageRes = await fetch('/api/user/usage');
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData);
        }

        const teamRes = await fetch('/api/teams');
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData.team);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const usagePercentage = usage.limit && usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  if (!sidebarOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-50 p-3 glass-card bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl shadow-lg hover:bg-purple-500/30 transition-all glow-purple"
      >
        <ChevronRight className="w-5 h-5 text-purple-300" />
      </motion.button>
    );
  }

  const navItems = [
    { href: '/chat', icon: MessageSquare, label: 'Chat', active: pathname === '/chat' },
    { href: '/profile', icon: User, label: 'Profile', show: true },
    { href: '/admin/documents', icon: FileText, label: 'Documents', admin: true },
    { href: '/admin/analytics', icon: BarChart3, label: 'Analytics', admin: true },
    { href: '/admin/agents', icon: Bot, label: 'Agents', admin: true },
    { href: '/admin/guardrails', icon: Shield, label: 'Guardrails', admin: true },
    { href: '/admin/team', icon: Users, label: 'Team', show: true },
    { href: '/admin/billing', icon: CreditCard, label: 'Billing', show: true },
  ];

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-72 glass-dark border-r border-purple-500/20 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg glow-purple"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <span className="gradient-text font-bold text-xl">Nexus-AI</span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-purple-300" />
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/chat'}
          className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white py-3.5 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center gap-2 glow-purple"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </motion.button>

        <div className="mt-6 space-y-1">
          <button
            onClick={() => setRecentChatsOpen(!recentChatsOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 text-purple-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-all duration-200 group"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
              <span className="text-sm font-medium">Recent Chats</span>
            </div>
            <motion.div
              animate={{ rotate: recentChatsOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {recentChatsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 mt-2 space-y-1"
              >
                <Link
                  href="/chat"
                  className="block px-3 py-2 text-sm text-purple-300/70 hover:text-cyan-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                >
                  Chat Session
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-6 border-t border-purple-500/20">
          <div className="text-xs text-purple-300/60 uppercase tracking-wider mb-2 px-3 font-semibold">Today</div>
          <div className="space-y-1">
            <Link
              href="/chat"
              className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                pathname === '/chat'
                  ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white border border-purple-400/50 shadow-lg shadow-purple-500/20'
                  : 'text-purple-300/70 hover:text-white hover:bg-purple-500/10'
              }`}
            >
              Chat Interface
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-6 pt-6 border-t border-purple-500/20">
          <div className="text-xs text-purple-300/60 uppercase tracking-wider mb-2 px-3 font-semibold">Navigation</div>
          <div className="space-y-1">
            {navItems.map((item) => {
              if (item.admin && !pathname?.startsWith('/admin')) {
                return null;
              }
              if (item.show === false) {
                return null;
              }
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    item.active
                      ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white border border-purple-400/50 shadow-lg shadow-purple-500/20'
                      : 'text-purple-300/70 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="p-4 border-t border-purple-500/20 space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-cyan-900/40 rounded-xl p-4 border border-purple-500/30 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-purple-200 font-medium capitalize">
              {team?.plan?.display_name || usage.plan || 'Free'} Plan
            </div>
            {usage.unlimited ? (
              <div className="text-xs gradient-text-green font-semibold">Unlimited</div>
            ) : (
              <div className="text-xs gradient-text-cyan font-semibold">
                {usage.used.toLocaleString()} / {usage.limit?.toLocaleString() || '∞'}
              </div>
            )}
          </div>
          {!usage.unlimited && (
            <div className="mb-2">
              <div className="w-full bg-purple-900/30 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    usagePercentage > 80
                      ? 'bg-gradient-to-r from-red-500 via-pink-500 to-red-600'
                      : usagePercentage > 50
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500'
                  } shadow-lg`}
                />
              </div>
            </div>
          )}
          <div className="text-xs text-purple-300/70">
            {usage.unlimited ? 'Unlimited tokens' : usagePercentage < 1 ? 'Just getting started' : `${Math.round(usagePercentage)}% used`}
          </div>
          {usage.plan === 'free' && (
            <Link
              href="/pricing"
              className="mt-3 block text-center text-xs gradient-text-cyan hover:scale-105 transition-transform"
            >
              Upgrade to Premium →
            </Link>
          )}
        </motion.div>

        <Link
          href="/admin/documents"
          className="block w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center justify-center gap-2 glow-purple"
        >
          <Zap className="w-4 h-4" />
          Admin Panel
        </Link>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-purple-500/20">
        <a
          href="/api/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 text-purple-300/70 hover:text-white hover:bg-purple-500/10 rounded-lg transition-all duration-200 group border border-transparent hover:border-purple-500/20"
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </div>
    </motion.div>
  );
}
