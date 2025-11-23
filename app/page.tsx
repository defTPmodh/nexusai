'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { Sparkles, MessageSquare, Zap, Shield, Cpu, Link2, ArrowUpRight, Bot } from 'lucide-react';
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
    const featureCards = [
      {
        icon: <Bot className="w-6 h-6 text-emerald-300" />,
        title: 'Adaptive AI Orchestration',
        description:
          'Blend NVIDIA, DeepSeek, and OpenAI models with context-aware routing for every conversation.',
      },
      {
        icon: <Shield className="w-6 h-6 text-cyan-300" />,
        title: 'Enterprise Guardrails',
        description: 'SSO-first authentication, data residency controls, and audit-ready observability.',
      },
      {
        icon: <Cpu className="w-6 h-6 text-purple-200" />,
        title: 'Production Reliability',
        description: 'Autoscale securely, trace every token, and keep latency predictable under load.',
      },
    ];

    return (
      <div className="min-h-screen relative overflow-hidden px-6 py-10 text-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="aurora-veil" />
        <div className="absolute inset-0 floating-dots" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-violet-500/30 flex items-center justify-center neon-border">
                <Sparkles className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">Nexus AI OS</p>
                <h1 className="text-2xl font-semibold">Orchestrate intelligence at scale</h1>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span className="rounded-full px-3 py-1 bg-white/5 border border-white/10">SOC2 aligned</span>
              <span className="rounded-full px-3 py-1 bg-white/5 border border-white/10">SSO-first</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-emerald-200/80">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live: Unified control plane for your AI stack
              </div>
              <h2 className="text-4xl sm:text-5xl font-semibold leading-tight">
                <span className="gradient-text">Modern, futuristic</span> orchestration for enterprise teams.
              </h2>
              <p className="text-lg text-white/70 leading-relaxed">
                Nexus-AI brings every model, vector store, and document into one luminous workspace. Build chat experiences with
                confident governance, sharp observability, and a design system built for the future.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="/api/auth/login"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 font-semibold text-black shadow-[0_12px_50px_rgba(34,211,238,0.35)]"
                >
                  Sign in with SSO
                </a>
                <Link
                  href="/pricing"
                  className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 hover:border-white/40 text-white flex items-center gap-2"
                >
                  View pricing
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="glass-card p-4 rounded-xl neon-border">
                  <p className="text-3xl font-semibold text-emerald-200">120ms</p>
                  <p className="text-white/60">Median latency across providers</p>
                </div>
                <div className="glass-card p-4 rounded-xl neon-border">
                  <p className="text-3xl font-semibold text-cyan-200">99.95%</p>
                  <p className="text-white/60">Uptime with adaptive failover</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-violet-600/10 blur-3xl" />
              <div className="glass-card neon-border rounded-3xl p-8 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-white/60">Realtime Console</p>
                    <p className="text-xl font-semibold">Hybrid Model Mesh</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-200 text-xs border border-emerald-400/30">Live</div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/30 via-cyan-400/30 to-violet-500/30 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-emerald-200" />
                        </div>
                        <div>
                          <p className="font-semibold">Conversation {item}</p>
                          <p className="text-xs text-white/60">Guardrails enforced • Multi-model route</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-emerald-200">Stable</p>
                        <p className="text-xs text-white/50">Latency 120ms</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 text-sm text-white/70">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Transparent observability and controls tuned for global teams.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureCards.map((feature) => (
              <div key={feature.title} className="glass-card rounded-2xl p-6 neon-border">
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div className="aurora-veil" />

        <main className="flex-1 overflow-y-auto px-12 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-10"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/80">Control Center</p>
                <h1 className="text-4xl font-bold gradient-text mb-2">
                  Welcome back, {user.name || user.email?.split('@')[0]}
                </h1>
                <p className="text-white/70 text-lg">
                  Seamless orchestration across chats, documents, and observability.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/chat"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 font-semibold text-black shadow-[0_10px_40px_rgba(34,211,238,0.25)]"
                >
                  Launch chat
                </Link>
                <Link
                  href="/admin/documents"
                  className="px-5 py-3 rounded-xl border border-white/15 bg-white/5 hover:border-white/30 text-white"
                >
                  Manage data
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card neon-border rounded-2xl p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-400/15 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-emerald-200" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Conversations</p>
                      <p className="text-xl font-semibold">Chat Interface</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-white/65 text-sm leading-relaxed">
                  Route requests across NVIDIA, DeepSeek, and OpenAI with adaptive guardrails.
                </p>
                <Link href="/chat" className="inline-flex items-center gap-2 text-emerald-200 text-sm">
                  Open workspace
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="glass-card neon-border rounded-2xl p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-cyan-400/15 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-cyan-200" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Control Plane</p>
                      <p className="text-xl font-semibold">Admin Dashboard</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-white/65 text-sm leading-relaxed">
                  Manage documents, analytics, and agent configurations with precision.
                </p>
                <Link href="/admin/documents" className="inline-flex items-center gap-2 text-cyan-200 text-sm">
                  Go to dashboard
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="glass-card neon-border rounded-2xl p-7 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-400/15 flex items-center justify-center">
                      <Link2 className="w-6 h-6 text-violet-200" />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Pipelines</p>
                      <p className="text-xl font-semibold">Integrations</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-white/65 text-sm leading-relaxed">
                  Connect vector stores, data lakes, and analytics to keep conversations in sync.
                </p>
                <Link href="/admin/documents" className="inline-flex items-center gap-2 text-violet-200 text-sm">
                  Configure sources
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
