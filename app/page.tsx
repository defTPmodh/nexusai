'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { Sparkles, MessageSquare, Zap } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="max-w-md w-full glass-card border border-purple-500/30 rounded-2xl p-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-purple">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Nexus-AI</h1>
          <p className="text-purple-200/70 mb-8">
            Enterprise AI Orchestration Platform
          </p>
          <a
            href="/api/auth/login"
            className="block w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all glow-purple"
          >
            Sign In with SSO
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        <main className="flex-1 overflow-y-auto px-12 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Welcome back, {user.name || user.email?.split('@')[0]}
            </h1>
            <p className="text-purple-200/70 text-lg mb-12">
              Choose an option to get started
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/chat"
                className="group glass-card border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover-lift"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:from-purple-500/50 group-hover:to-indigo-500/50 transition-all border border-purple-400/30">
                  <MessageSquare className="w-7 h-7 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Chat Interface</h3>
                <p className="text-purple-200/70 text-sm leading-relaxed">
                  Interact with NVIDIA, DeepSeek, and OpenAI models
                </p>
              </Link>

              <Link
                href="/admin/documents"
                className="group glass-card border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all hover-lift"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center mb-6 group-hover:from-purple-500/50 group-hover:to-indigo-500/50 transition-all border border-purple-400/30">
                  <Zap className="w-7 h-7 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Admin Dashboard</h3>
                <p className="text-purple-200/70 text-sm leading-relaxed">
                  Manage documents, analytics, and agents
                </p>
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
