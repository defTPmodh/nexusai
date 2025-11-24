'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Grid,
  MessageSquare,
  Radar,
  Rocket,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
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
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#07070f] via-[#0b0b16] to-[#04040b] text-white">
        <div className="absolute inset-0 opacity-70" aria-hidden>
          <div className="absolute -left-32 top-10 h-96 w-96 bg-purple-600/15 blur-[160px]" />
          <div className="absolute right-10 top-0 h-96 w-96 bg-cyan-400/15 blur-[160px]" />
          <div className="absolute left-1/2 bottom-0 h-[520px] w-[520px] -translate-x-1/2 bg-indigo-500/10 blur-[200px]" />
        </div>

        <div className="relative z-10 px-6 pt-14 pb-16 lg:px-12">
          <div className="max-w-6xl mx-auto flex flex-col gap-12">
            <header className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-[0_10px_60px_-30px_rgba(124,58,237,0.9)]">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-purple-100/80">React Bits • Premium AI canvas</p>
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    The Enterprise AI Orchestration Layer for High-Scale Applications.
                  </h1>
                  <p className="text-lg text-purple-100/70 max-w-3xl">
                    Nexus AI connects and manages your LLM workflow—from XAI and Minimax M2 to OpenAI—providing intelligent routing, compliance, and real-time observability your teams need to scale trusted applications.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href="/api/auth/login"
                    className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-sm font-semibold shadow-lg shadow-purple-500/30 transition hover:shadow-purple-400/40"
                  >
                    Launch the workspace
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </a>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-purple-100/80 transition hover:border-purple-400/40"
                  >
                    Schedule a Technical Deep Dive
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: 'Intelligent Model Routing',
                      detail: 'Optimize cost while balancing DeepSeek, OpenAI, NVIDIA.',
                      icon: Route,
                    },
                    {
                      label: 'Enterprise Compliance & Auditing',
                      detail: 'Mitigate risk with SSO, SCIM, and audit trails.',
                      icon: ShieldCheck,
                    },
                    {
                      label: 'Real-Time Observability',
                      detail: 'Faster debugging with live usage, latency, trust.',
                      icon: Activity,
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-purple-500/10 backdrop-blur">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/25 to-cyan-400/25">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-purple-100/70">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-purple-500/25 via-indigo-500/15 to-cyan-400/20 blur-3xl" aria-hidden />
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),transparent_35%),radial-gradient(circle_at_70%_0%,rgba(6,182,212,0.22),transparent_30%)]" aria-hidden />
                  <div className="relative z-10 space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-purple-100/60">Live workspace</p>
                        <p className="text-xl font-semibold">Live AI Performance & Trust</p>
                      </div>
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500/60 to-cyan-400/60 flex items-center justify-center">
                        <Wand2 className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-left">
                      {[
                        { label: 'Latency', value: '82ms', accent: 'from-emerald-400/70 to-cyan-400/60' },
                        { label: 'Uptime', value: '99.99%', accent: 'from-purple-400/70 to-indigo-400/60' },
                        { label: 'Requests', value: '2.3M', accent: 'from-amber-300/70 to-orange-400/60' },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-purple-500/10">
                          <div className={`mb-3 h-10 w-10 rounded-xl bg-gradient-to-br ${metric.accent}`} />
                          <p className="text-xs text-purple-100/60">{metric.label}</p>
                          <p className="text-xl font-semibold">{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { title: 'Intelligent routing control', copy: 'Resilient multi-model fallback & load balance', icon: Route },
                        { title: 'Real-time transparency', copy: 'Live traces, compliance, usage signals', icon: Radar },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-purple-500/40">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-purple-100/70">{item.title}</p>
                            <p className="text-lg font-semibold">{item.copy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-100/70">React bits suite</p>
                    <p className="text-xl font-semibold">Composable sections crafted for story-driven apps.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[{ title: 'Launch-ready', desc: 'Hero, highlights, CTA strips and stat bars that animate out of the box.', icon: Rocket }, { title: 'Trust by default', desc: 'Enterprise-grade guardrails with SSO, auditability, and private tenancy.', icon: Shield }, { title: 'Adaptive insights', desc: 'Live usage, routing heatmaps, and latency ribbons tuned for observability.', icon: Zap }].map((card) => (
                    <div key={card.title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition hover:-translate-y-1 hover:border-purple-400/40">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 opacity-0 transition group-hover:opacity-100" />
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/25 to-cyan-400/25">
                        <card.icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold">{card.title}</h3>
                      <p className="text-sm text-purple-100/70 leading-relaxed">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-white/5 via-purple-500/5 to-cyan-500/5 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100/70">Signal board</p>
                    <p className="text-2xl font-semibold">Instant clarity across teams</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs">Live</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[{ label: 'Active seats', value: '128', tone: 'from-emerald-400/60 to-cyan-400/60' }, { label: 'Models blended', value: '9', tone: 'from-purple-400/60 to-indigo-400/60' }, { label: 'Avg. latency', value: '82ms', tone: 'from-amber-300/70 to-orange-400/60' }, { label: 'Trust score', value: '99.5%', tone: 'from-emerald-400/60 to-lime-400/60' }].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className={`mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br ${stat.tone}`} />
                      <p className="text-xs text-purple-100/60">{stat.label}</p>
                      <p className="text-xl font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
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
