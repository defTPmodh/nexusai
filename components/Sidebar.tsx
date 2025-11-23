'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, ChevronRight, Settings, Sparkles, Plus, Zap, History, FileText, BarChart3, Bot, X, Users, CreditCard, User, Shield } from 'lucide-react';
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
  const isAdmin = Boolean(
    team?.role === 'admin' ||
    team?.role === 'owner' ||
    team?.is_admin ||
    team?.permissions?.admin === true
  );

  const quickLinks = [
    { href: '/chat', label: 'Ask anything', icon: Sparkles },
    { href: '/profile', label: 'Your workspace', icon: User },
    { href: '/admin/documents', label: 'Knowledge base', icon: FileText, admin: true },
  ];

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
      className="w-[19rem] max-w-[19rem] bg-gradient-to-b from-[#0f0b20] via-[#0c0a1a] to-[#06050f] border-r border-purple-500/15 flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/15 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-cyan-900/20">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.05 }}
              transition={{ duration: 0.6 }}
              className="w-11 h-11 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-purple-500/30"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div className="leading-tight">
              <span className="gradient-text font-bold text-xl block">Nexus-AI</span>
              <span className="text-[11px] text-purple-200/70 tracking-wide">Adaptive copilots</span>
            </div>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-purple-500/15 rounded-xl transition-colors border border-purple-500/10"
          >
            <X className="w-4 h-4 text-purple-200" />
          </motion.button>
        </div>

        <div className="mt-4 flex gap-2">
          <span className="px-2.5 py-1 text-[11px] uppercase tracking-[0.15em] text-purple-100 bg-purple-500/20 rounded-full border border-purple-500/20">
            Beta
          </span>
          <span className="px-2.5 py-1 text-[11px] text-cyan-100 bg-cyan-500/15 rounded-full border border-cyan-500/20 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Live
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/chat'}
          className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white py-3.5 px-4 rounded-2xl font-semibold shadow-lg shadow-purple-700/40 hover:shadow-purple-500/50 transition-all duration-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5" />
            <span>Start a new chat</span>
          </div>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">⌘ + N</span>
        </motion.button>

        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((item) => {
            if (item.admin && !isAdmin) return null;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-purple-500/15 bg-white/5 backdrop-blur-sm p-3 hover:border-cyan-500/40 transition-all duration-200 shadow-inner shadow-black/20"
              >
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 via-indigo-500/20 to-cyan-500/20 text-cyan-100 ring-1 ring-purple-500/20 group-hover:ring-cyan-500/30 transition">
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="text-sm font-medium text-purple-50 group-hover:text-white">{item.label}</div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="rounded-2xl border border-purple-500/15 bg-white/5 backdrop-blur-sm p-4 shadow-inner shadow-black/20">
          <button
            onClick={() => setRecentChatsOpen(!recentChatsOpen)}
            className="w-full flex items-center justify-between text-purple-100 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-300" />
              <span className="text-sm font-semibold">Recent chats</span>
            </div>
            <motion.div
              animate={{ rotate: recentChatsOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-purple-200"
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
                className="mt-3 space-y-2"
              >
                <Link
                  href="/chat"
                  className="flex items-center justify-between px-3 py-2 text-sm text-purple-200/80 hover:text-white hover:bg-purple-500/10 rounded-xl transition-colors"
                >
                  Chat interface
                  <span className="text-[11px] px-2 py-1 rounded-full bg-purple-500/15 border border-purple-500/20 text-purple-100">Today</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-2">
          <div className="text-xs text-purple-200/70 uppercase tracking-[0.12em] mb-3 px-1 font-semibold">Navigate</div>
          <div className="space-y-2">
            {navItems.map((item) => {
              if (item.admin && !isAdmin) {
                return null;
              }
              if (item.show === false) {
                return null;
              }
              const Icon = item.icon;
              const active = item.active || pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200 bg-white/5 backdrop-blur-sm ${
                    active
                      ? 'border-cyan-500/60 text-white shadow-lg shadow-cyan-500/20'
                      : 'border-purple-500/10 text-purple-200/80 hover:border-cyan-500/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg ring-1 ${active ? 'bg-cyan-500/15 ring-cyan-400/60 text-cyan-100' : 'bg-purple-500/10 ring-purple-500/20 text-purple-100/90'}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {active && <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-200">Active</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="p-5 border-t border-purple-500/20 space-y-3 bg-white/5 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-cyan-900/40 rounded-2xl p-4 border border-purple-500/30 shadow-lg"
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
          <div className="text-xs text-purple-100/80 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            {usage.unlimited ? 'Unlimited tokens' : usagePercentage < 1 ? 'Just getting started' : `${Math.round(usagePercentage)}% used`}
          </div>
          {usage.plan === 'free' && (
            <Link
              href="/pricing"
              className="mt-3 block text-center text-xs text-cyan-100 hover:text-white hover:scale-105 transition-transform"
            >
              Upgrade to Premium →
            </Link>
          )}
        </motion.div>

        <Link
          href="/admin/documents"
          className="block w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white py-3 px-4 rounded-2xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          Admin Panel
        </Link>
      </div>

      {/* Settings */}
      <div className="p-5 border-t border-purple-500/20 bg-[#06050f]/80 backdrop-blur">
        <a
          href="/api/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 text-purple-200/80 hover:text-white hover:bg-purple-500/10 rounded-xl transition-all duration-200 group border border-purple-500/10 hover:border-cyan-500/30"
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </div>
    </motion.div>
  );
}
