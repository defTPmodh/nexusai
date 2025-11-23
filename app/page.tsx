'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  Zap,
  ArrowRight,
  Shield,
  Wand2,
  Clock,
  Cpu,
  Rocket,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b12] via-[#0e0e16] to-[#0b0b12] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.12),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.1),transparent_30%)]" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 px-6 py-4 rounded-full glass-card border border-purple-500/30 shadow-2xl"
        >
          <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 animate-pulse" />
          <div className="text-purple-100/80 font-medium">Loading your workspace...</div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#090910] via-[#0f0f16] to-[#090910] text-white">
        {/* Ambient glows */}
        <div className="absolute inset-0 opacity-60" aria-hidden>
          <div className="absolute -top-32 -left-20 h-80 w-80 bg-purple-500/20 blur-[120px]" />
          <div className="absolute -bottom-20 left-24 h-96 w-96 bg-cyan-400/10 blur-[140px]" />
          <div className="absolute right-10 top-10 h-72 w-72 bg-indigo-500/15 blur-[120px]" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_70%_40%,rgba(99,102,241,0.14),transparent_30%),radial-gradient(circle_at_40%_80%,rgba(6,182,212,0.08),transparent_26%)] opacity-80" />

        <div className="absolute inset-x-0 top-10 flex justify-center" aria-hidden>
          <div className="h-20 w-[720px] bg-gradient-to-r from-purple-500/10 via-indigo-500/20 to-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 px-6 pt-16 pb-20 lg:px-14">
          <header className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card border border-purple-500/30">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-sm text-purple-100/80">Enterprise AI Orchestration • Built for velocity</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="gradient-text">Nexus-AI</span> for teams who demand more.
                </h1>
                <p className="text-lg text-purple-100/70 max-w-2xl mx-auto lg:mx-0">
                  Launch model-rich experiences with cinematic motion, curated prompts, and real-time visibility. Secure, fast, and crafted to feel premium from the first click.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <a
                  href="/api/auth/login"
                  className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-400/40"
                >
                  Start with SSO
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full glass-card border border-white/10 text-purple-100/80 hover:border-purple-400/40"
                >
                  Explore pricing
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">New</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto lg:mx-0">
                {[
                  { label: 'AI routing + memory', icon: Cpu },
                  { label: 'SSO + enterprise guardrails', icon: Shield },
                  { label: 'Live analytics streaming', icon: Rocket },
                ].map((item) => (
                  <div key={item.label} className="glass-card border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-purple-100" />
                    </div>
                    <span className="text-sm text-purple-100/80">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative w-full max-w-xl"
            >
              <div className="absolute -inset-8 bg-gradient-to-br from-purple-500/15 via-indigo-500/10 to-cyan-400/15 blur-3xl rounded-[36px]" aria-hidden />
              <div className="glass-card border border-white/10 rounded-[28px] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.2),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.18),transparent_26%)]" aria-hidden />
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100/70">Realtime insights</p>
                      <p className="text-2xl font-semibold">Orchestration Pulse</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/50 to-cyan-400/50 flex items-center justify-center shadow-inner shadow-purple-500/30">
                      <Wand2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-left">
                    {[
                      { label: 'Latency', value: '82ms', accent: 'from-emerald-400/70 to-cyan-400/60' },
                      { label: 'Uptime', value: '99.99%', accent: 'from-purple-400/70 to-indigo-400/60' },
                      { label: 'Requests', value: '2.3M', accent: 'from-amber-300/70 to-orange-400/60' },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/10 p-4 glass-card">
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${metric.accent} mb-3`} />
                        <p className="text-xs text-purple-100/60">{metric.label}</p>
                        <p className="text-xl font-semibold">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl glass-card border border-white/10 p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400/30 to-purple-500/40 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-100/70">Conversational routing</p>
                        <p className="text-lg font-semibold">NVIDIA + OpenAI + DeepSeek</p>
                      </div>
                    </div>
                    <div className="rounded-2xl glass-card border border-white/10 p-4 flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400/30 to-cyan-500/40 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-100/70">Observability</p>
                        <p className="text-lg font-semibold">Live traces & usage</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </header>

          <section className="mt-14 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Guarded by design',
                desc: 'Role-aware controls, audit trails, and private boundaries built-in.',
                icon: Shield,
              },
              {
                title: 'Create in motion',
                desc: 'Micro-interactions, shimmering loaders, and fluid transitions out of the box.',
                icon: Sparkles,
              },
              {
                title: 'Launch faster',
                desc: 'Prebuilt chat, analytics, and invite flows so teams ship in days, not weeks.',
                icon: Zap,
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={fadeInUp}
                className="glass-card border border-white/10 rounded-2xl p-6 hover:border-purple-400/30 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5 text-purple-100" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-purple-100/70 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative bg-gradient-to-br from-[#0c0c12] via-[#0f0f18] to-[#0c0c12]">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.08),transparent_30%)]" aria-hidden />

        <main className="flex-1 overflow-y-auto px-10 py-12 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="max-w-5xl mx-auto space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-stretch">
              <div className="glass-card border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-cyan-400/10 blur-3xl" aria-hidden />
                <div className="relative z-10 flex items-center justify-between gap-6 flex-wrap">
                  <div className="space-y-3">
                    <p className="text-sm text-purple-100/70">Welcome back</p>
                    <h1 className="text-3xl font-bold">{user.name || user.email?.split('@')[0]}</h1>
                    <p className="text-purple-100/70">Pick where you want to begin today.</p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/chat"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-sm font-semibold shadow-lg shadow-purple-500/30"
                      >
                        Open chat
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/admin/documents"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-white/10 text-sm text-purple-100/80"
                      >
                        Admin console
                      </Link>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <div className="rounded-xl border border-white/10 glass-card p-4 min-w-[220px]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs uppercase tracking-wide text-purple-100/60">Session health</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <p className="text-2xl font-semibold">Stable</p>
                      <p className="text-sm text-purple-100/60">Latency is smooth across regions</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[{
                  label: 'Analytics',
                  href: '/admin/analytics',
                  icon: Sparkles,
                  accent: 'from-cyan-400/30 to-purple-500/30',
                },
                {
                  label: 'Team status',
                  href: '/admin/team',
                  icon: Shield,
                  accent: 'from-purple-400/30 to-indigo-400/30',
                },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`group rounded-2xl glass-card border border-white/10 p-5 flex flex-col gap-3 hover:border-purple-400/40 bg-gradient-to-br ${item.accent}`}
                  >
                    <div className="h-11 w-11 rounded-xl bg-black/30 flex items-center justify-center border border-white/10">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-purple-100/70">Navigate</p>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        {item.label}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[{
                title: 'Chat workspace',
                desc: 'Blend NVIDIA, DeepSeek, and OpenAI in one fluid canvas.',
                icon: MessageSquare,
                href: '/chat',
              },
              {
                title: 'Documents',
                desc: 'Upload, tag, and govern sources powering your agents.',
                icon: Zap,
                href: '/admin/documents',
              },
              {
                title: 'Invites',
                desc: 'Send curated invites with brand-forward landing flows.',
                icon: Rocket,
                href: '/invite/sample',
              }].map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="glass-card border border-white/10 rounded-2xl p-6 flex flex-col gap-3 hover:border-purple-400/40"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{card.title}</h3>
                    <p className="text-sm text-purple-100/70 leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="text-sm text-purple-100/60 inline-flex items-center gap-2">
                    Open
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
