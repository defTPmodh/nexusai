'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, ChevronRight, Settings, Sparkles, Plus, Zap, History, FileText, BarChart3, Bot, X, Users, CreditCard, User, Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/components/ThemeProvider';
import FluidGlassBadge from '@/components/effects/FluidGlassBadge';

export default function Sidebar() {
  const { user } = useUser();
  const { theme } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentChatsOpen, setRecentChatsOpen] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: 100000, plan: 'free', unlimited: false });
  const [team, setTeam] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
      } finally {
        setIsLoadingData(false);
      }
    };
    if (user) {
      fetchData();
    } else {
      setIsLoadingData(false);
    }
  }, [user]);

  const usagePercentage = usage.limit && usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  if (!sidebarOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setSidebarOpen(true)}
        className={`fixed left-4 top-4 z-50 p-3 glass-card rounded-xl shadow-lg transition-all ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 hover:bg-purple-500/30 glow-purple'
            : 'bg-white border border-slate-300/70 hover:bg-slate-100'
        }`}
      >
        <ChevronRight className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-300' : 'text-slate-700'}`} />
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

  const navVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.05 * index, type: 'spring', stiffness: 200, damping: 20 }
    })
  };
  const isDark = theme === 'dark';
  const containerClass = isDark
    ? 'w-72 glass-dark border-r border-purple-500/20'
    : 'w-72 bg-white/90 border-r border-slate-200/90 backdrop-blur-2xl';
  const subtleBorderClass = isDark ? 'border-purple-500/20' : 'border-slate-200/80';
  const sectionLabelClass = isDark ? 'text-purple-300/60' : 'text-slate-500';
  const activeLinkClass = isDark
    ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-white border border-purple-400/50 shadow-lg shadow-purple-500/20'
    : 'bg-gradient-to-r from-indigo-500/15 to-cyan-500/10 text-slate-900 border border-indigo-300/40 shadow-md shadow-indigo-200/40';
  const inactiveLinkClass = isDark
    ? 'text-purple-300/70 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:border-slate-300/60';
  const iconTextClass = isDark ? 'text-purple-300' : 'text-slate-600';
  const panelCardClass = isDark
    ? 'relative glass-card bg-gradient-to-br from-purple-900/40 via-indigo-900/40 to-cyan-900/40 rounded-xl p-4 border border-purple-500/30 shadow-lg overflow-hidden'
    : 'relative glass-card bg-gradient-to-br from-white via-slate-50 to-cyan-50 rounded-xl p-4 border border-slate-200/90 shadow-md overflow-hidden';

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className={`${containerClass} flex flex-col h-screen fixed left-0 top-0 z-40 shadow-2xl overflow-hidden`}
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.22), transparent 30%)',
            'radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.18), transparent 32%)',
            'radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.18), transparent 28%)'
          ]
        }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      />

      {/* Logo */}
      <div className={`relative p-6 border-b backdrop-blur-xl overflow-hidden ${subtleBorderClass} ${isDark ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/30' : 'bg-gradient-to-r from-indigo-100/90 to-cyan-100/80'}`}>
        <motion.span
          className="absolute -right-6 -top-10 h-24 w-24 bg-gradient-to-br from-cyan-400/30 via-purple-500/30 to-indigo-500/30 rounded-full blur-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        />
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isDark ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 glow-purple' : 'bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400'}`}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <FluidGlassBadge className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className={`bg-clip-text ${isDark ? 'gradient-text' : ''}`}>Nexus-AI</span>
            </FluidGlassBadge>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(false)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-purple-500/20' : 'hover:bg-slate-200/80'}`}
          >
            <X className={`w-4 h-4 ${iconTextClass}`} />
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-purple-900/5 pointer-events-none" />
        <motion.div
          className="absolute -left-24 top-12 h-48 w-48 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 12, -10, 0], y: [0, 6, -8, 0], rotate: [0, 6, -4, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/chat'}
          className="relative overflow-hidden w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white py-3.5 px-4 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200 flex items-center gap-2 glow-purple"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"
            animate={{ x: ['-40%', '140%'] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            className="absolute -left-8 h-16 w-16 bg-white/10 blur-2xl"
            animate={{ x: ['0%', '220%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
          />
          <Plus className="w-5 h-5" />
          New Chat
        </motion.button>

        <div className="mt-6 space-y-1">
          <button
            onClick={() => setRecentChatsOpen(!recentChatsOpen)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden ${isDark ? 'text-purple-300 hover:text-white hover:bg-purple-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'}`}
          >
          <motion.span
              className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.4 }}
            />
            <div className="flex items-center gap-2">
              <History className={`w-4 h-4 transition-colors ${isDark ? 'group-hover:text-cyan-400' : 'group-hover:text-indigo-500'}`} />
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
                  className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'text-purple-300/70 hover:text-cyan-400 hover:bg-purple-500/10' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'}`}
                >
                  Chat Session
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`mt-6 pt-6 border-t ${subtleBorderClass}`}>
          <div className={`text-xs uppercase tracking-wider mb-2 px-3 font-semibold ${sectionLabelClass}`}>Today</div>
          <div className="space-y-1">
            <Link
              href="/chat"
              className={`block px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                pathname === '/chat'
                  ? activeLinkClass
                  : inactiveLinkClass
              }`}
            >
              Chat Interface
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <div className={`mt-6 pt-6 border-t ${subtleBorderClass}`}>
          <div className={`text-xs uppercase tracking-wider mb-2 px-3 font-semibold ${sectionLabelClass}`}>Navigation</div>
          <motion.div className="space-y-1" initial="hidden" animate="visible">
            {navItems.map((item, index) => {
              if (item.admin && !pathname?.startsWith('/admin')) {
                return null;
              }
              if (item.show === false) {
                return null;
              }
              const Icon = item.icon;
              return (
                <motion.div key={item.href} variants={navVariants} custom={index}>
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative overflow-hidden ${
                      item.active
                        ? activeLinkClass
                        : `${inactiveLinkClass} border border-transparent`
                    }`}
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.4 }}
                    />
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                    <motion.div
                      className="ml-auto h-1 w-6 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-100"
                      animate={{ scaleX: item.active ? 1 : [0.6, 1, 0.6] }}
                      transition={{ duration: 1.8, repeat: item.active ? Infinity : 0, ease: 'easeInOut' }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Account Status */}
      <div className={`p-4 border-t space-y-3 ${subtleBorderClass}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={panelCardClass}
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          />
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className={`text-xs font-medium capitalize ${isDark ? 'text-purple-200' : 'text-slate-700'}`}>
                {team?.plan?.display_name || usage.plan || 'Free'} Plan
              </div>
              {isLoadingData ? (
                <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-purple-200' : 'text-slate-600'}`}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Loading
                </div>
              ) : usage.unlimited ? (
                <div className="text-xs gradient-text-green font-semibold">Unlimited</div>
              ) : (
                <div className="text-xs gradient-text-cyan font-semibold">
                  {usage.used.toLocaleString()} / {usage.limit?.toLocaleString() || '∞'}
                </div>
              )}
            </div>
            {!usage.unlimited && (
              <div className="mb-2">
                <div className={`w-full rounded-full h-2.5 overflow-hidden ${isDark ? 'bg-purple-900/30 border border-purple-500/30' : 'bg-slate-200 border border-slate-300/70'}`}>
                  {isLoadingData ? (
                    <div className="h-full w-full bg-gradient-to-r from-purple-500/30 via-cyan-400/30 to-purple-500/30 animate-pulse" />
                  ) : (
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
                  )}
                </div>
              </div>
            )}
            <div className={`text-xs ${isDark ? 'text-purple-300/70' : 'text-slate-600'}`}>
              {usage.unlimited
                ? 'Unlimited tokens'
                : isLoadingData
                ? 'Fetching your usage stats...'
                : usagePercentage < 1
                ? 'Just getting started'
                : `${Math.round(usagePercentage)}% used`}
            </div>
            {usage.plan === 'free' && (
              <Link
                href="/pricing"
                className="mt-3 block text-center text-xs gradient-text-cyan hover:scale-105 transition-transform"
              >
                Upgrade to Premium →
              </Link>
            )}
          </div>
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
      <div className={`p-4 border-t ${subtleBorderClass}`}>
        <div className="mb-3">
          <ThemeToggle className={`w-full justify-center ${isDark ? 'border-white/15 bg-white/5 text-white hover:bg-white/10' : 'border-slate-300/80 bg-white text-slate-700 hover:bg-slate-100'}`} />
        </div>
        <a
          href="/api/auth/logout"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group border border-transparent ${isDark ? 'text-purple-300/70 hover:text-white hover:bg-purple-500/10 hover:border-purple-500/20' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300/60'}`}
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-medium">Settings</span>
        </a>
      </div>
    </motion.div>
  );
}
