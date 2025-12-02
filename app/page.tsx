'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import {
  ArrowRight,
  Gauge,
  Github,
  Grid,
  MessageSquare,
  PanelsTopLeft,
  Rocket,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  Wand2,
  Workflow,
  Zap,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Manrope } from 'next/font/google';

const headingFont = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-heading',
});

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const orbitGlow = {
  animate: {
    x: [0, 10, -10, 0],
    y: [0, -8, 8, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 14,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const parallaxWave = {
  animate: {
    x: [0, -12, 12, 0],
    transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
  },
};

const floatGlow = {
  animate: {
    y: [0, -8, 0],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const pulseLine = {
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

const cardHover = {
  rest: { scale: 1, rotate: 0, y: 0 },
  hover: {
    scale: 1.03,
    rotate: -1.25,
    y: -10,
    transition: { type: 'spring', stiffness: 220, damping: 18 },
  },
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
    const experienceCards = [
      {
        title: 'Executive-grade governance',
        copy: 'Granular policies, approvals, and live audit trails mapped to your risk posture.',
        icon: ShieldCheck,
      },
      {
        title: 'Data lineage clarity',
        copy: 'Every retrieval, transform, and model hop is traced for compliance reviews.',
        icon: Route,
      },
      {
        title: 'Financial accountability',
        copy: 'Spend, savings, and ROI surfaced per product line for the C-suite.',
        icon: Gauge,
      },
    ];

    const signalMetrics = [
      { label: 'TCO Reduction via Adaptive Routing', value: '38%', accent: 'from-purple-400/70 to-pink-400/70' },
      { label: 'PII Compliance & Safety Score', value: '99.7%', accent: 'from-cyan-300/80 to-indigo-400/80' },
      { label: 'Median Response Time', value: '62 ms', accent: 'from-emerald-400/60 to-cyan-400/60' },
      { label: 'Models online', value: '11', accent: 'from-amber-300/70 to-orange-400/60' },
    ];

    const runway = [
      {
        title: 'Securely Ground Your AI (RAG)',
        detail: 'Connect lakes, APIs, and vector stores with governed retrieval and masking.',
        icon: PanelsTopLeft,
      },
      {
        title: 'Design Your Zero-Risk Workflows',
        detail: 'Route prompts through approvals, policies, evals, and role-aware optimizers.',
        icon: Sparkles,
      },
      {
        title: 'Full Auditability and Isolation',
        detail: 'Real-time observability, multi-tenant isolation, and immutable evidence trails.',
        icon: Gauge,
      },
    ];

    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#05050c] via-[#080814] to-[#05050c] text-white">
        <div className="absolute inset-0 opacity-80" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.18),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(6,182,212,0.16),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.12),transparent_40%)]" />
          <motion.div
            className="absolute inset-x-0 top-16 h-px bg-[linear-gradient(90deg,rgba(124,58,237,0),rgba(124,58,237,0.6),rgba(6,182,212,0))]"
            variants={pulseLine}
            animate="animate"
          />
          <motion.div
            className="absolute inset-x-8 top-28 h-56 rounded-[32px] bg-gradient-to-r from-white/5 via-purple-500/10 to-cyan-400/10 blur-3xl"
            variants={parallaxWave}
            animate="animate"
          />
          <motion.div
            className="absolute inset-x-16 top-0 bottom-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_45%)] blur-3xl"
            variants={floatGlow}
            animate="animate"
          />
        </div>

        <div className="relative z-10 px-6 pt-10 pb-16 lg:px-12">
          <div className="max-w-6xl mx-auto flex flex-col gap-12">
            <header className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className={`flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.22em] text-purple-100/70 ${headingFont.className}`}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300" />
                    </span>
                    Enterprise command layer
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                    <Sparkles className="w-4 h-4" /> Risk, governance, ROI
                  </span>
                </div>

                <div className="space-y-4">
                  <h1
                    className={`${headingFont.className} text-4xl sm:text-5xl lg:text-[54px] font-semibold leading-[1.02] tracking-tight`}
                  >
                    The AI Control Room: Zero-Risk Governance and Guaranteed Compliance for Enterprise AI
                  </h1>
                  <p className="text-lg text-purple-100/80 max-w-3xl leading-relaxed">
                    Nexus AI gives CIOs and CFOs a live cockpit to enforce policy, prove compliance, and quantify ROI across every AI product—without slowing teams down.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <motion.a
                    href="/contact"
                    whileHover={{ scale: 1.03, y: -2 }}
                    className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 px-7 py-3.5 text-sm font-semibold shadow-lg shadow-emerald-400/30 transition hover:shadow-emerald-300/40"
                  >
                    Request Your AI Risk & ROI Projection
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </motion.a>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/0 px-5 py-2.5 text-sm text-purple-100/80 transition hover:border-purple-400/40"
                  >
                    Schedule a Technical Deep Dive
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {experienceCards.map((item, idx) => (
                    <motion.div
                      key={item.title}
                      variants={cardHover}
                      initial="rest"
                      animate="rest"
                      whileHover="hover"
                      whileTap="hover"
                      className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-purple-500/10 backdrop-blur relative overflow-hidden"
                      style={{ transformOrigin: idx % 2 === 0 ? 'top left' : 'top right' }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/10"
                        variants={pulseLine}
                        animate="animate"
                      />
                      <motion.div
                        className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-purple-500/20 via-indigo-500/15 to-cyan-400/20 blur-3xl"
                        variants={orbitGlow}
                        animate="animate"
                        aria-hidden
                      />
                      <div className="relative z-10 space-y-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/25 to-cyan-400/25">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <p className={`${headingFont.className} text-sm font-semibold`}>{item.title}</p>
                        <p className="text-xs text-purple-100/70 leading-relaxed">{item.copy}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="absolute -inset-8 rounded-[36px] bg-gradient-to-br from-purple-500/25 via-indigo-500/15 to-cyan-400/20 blur-3xl" aria-hidden />
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.25),transparent_35%),radial-gradient(circle_at_70%_0%,rgba(6,182,212,0.22),transparent_30%)]" aria-hidden />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-purple-100/60">Live workspace</p>
                        <p className={`${headingFont.className} text-xl font-semibold`}>Dynamic AI Control Room</p>
                      </div>
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-500/60 to-cyan-400/60 flex items-center justify-center">
                        <Wand2 className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {signalMetrics.map((metric, index) => (
                        <div
                          key={metric.label}
                          className={`rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-4 shadow-inner shadow-purple-500/10 ${index < 2 ? 'ring-2 ring-purple-400/40' : ''}`}
                        >
                          <div className={`mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br ${metric.accent}`} />
                          <p className="text-[11px] uppercase tracking-wide text-purple-100/60">{metric.label}</p>
                          <p className={`${headingFont.className} ${index < 2 ? 'text-3xl' : 'text-xl'} font-semibold`}>{metric.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 to-purple-500/40">
                          <Route className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`${headingFont.className} text-sm font-semibold`}>Adaptive routing mesh</p>
                          <p className="text-xs text-purple-100/70">Smart traffic shaping with eval-aware policies and safe fallbacks.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-purple-100/70">
                        {['XAI', 'Minimax M2', 'OpenAI', 'NVIDIA', 'Custom', 'Fallbacks'].map((chip) => (
                          <span
                            key={chip}
                            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-black/30 px-2 py-1"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
                    <Grid className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-100/70">Design playground</p>
                    <p className={`${headingFont.className} text-xl font-semibold`}>Story-driven sections that move with your brand</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    {
                      title: 'Accelerated Time-to-Market',
                      desc: 'Pre-built templates for audited deployment.',
                      icon: Workflow,
                    },
                    {
                      title: 'Guaranteed Data Security (PII Guardrails)',
                      desc: 'Enterprise guardrails, audit trails, and private tenancy baked in.',
                      icon: ShieldCheck,
                    },
                    {
                      title: 'Automated Cost Optimization',
                      desc: 'Real-time routing loops and latency monitoring to always use the cheapest model.',
                      icon: Gauge,
                    },
                  ].map((card) => (
                    <motion.div
                      key={card.title}
                      whileHover={{ y: -10, scale: 1.03 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
                    >
                      <motion.div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/10" variants={pulseLine} animate="animate" />
                      <div className="relative z-10 space-y-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/25 to-cyan-400/25">
                          <card.icon className="w-5 h-5" />
                        </div>
                        <h3 className={`${headingFont.className} text-lg font-semibold leading-tight`}>{card.title}</h3>
                        <p className="text-sm text-purple-100/70 leading-relaxed">{card.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-gradient-to-br from-white/5 via-purple-500/5 to-cyan-500/5 p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100/70">Signal board</p>
                    <p className={`${headingFont.className} text-2xl font-semibold`}>Instant clarity across teams</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs">Live</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  {[{ label: 'Active seats', value: '128', tone: 'from-emerald-400/60 to-cyan-400/60' }, { label: 'Models blended', value: '9', tone: 'from-purple-400/60 to-indigo-400/60' }, { label: 'Avg. latency', value: '62ms', tone: 'from-amber-300/70 to-orange-400/60' }, { label: 'Trust score', value: '99.5%', tone: 'from-emerald-400/60 to-lime-400/60' }].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className={`mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br ${stat.tone}`} />
                      <p className="text-xs text-purple-100/60">{stat.label}</p>
                      <p className="text-xl font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl relative overflow-hidden">
              <motion.div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(124,58,237,0.18),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(6,182,212,0.15),transparent_38%)]" animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-purple-100/70">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Enterprise acceleration, verified
                  </div>
                  <h2 className={`${headingFont.className} text-3xl sm:text-4xl font-semibold leading-tight`}>
                    Build, Govern, and Ship Your AI Products Faster.
                  </h2>
                  <p className="text-purple-100/80 leading-relaxed max-w-2xl">
                    Nexus AI keeps leadership in the loop with transparent guardrails, deterministic approvals, and rollout playbooks—so every AI initiative ships faster while staying compliant.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm"
                    >
                      View pricing & enterprise rollout
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="/api/auth/login"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold shadow-lg shadow-emerald-500/30"
                    >
                      Enter the live canvas
                    </a>
                  </div>
                </div>

                <div className="space-y-5">
                  {runway.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/25 to-cyan-400/25">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className={`${headingFont.className} text-sm font-semibold`}>{item.title}</p>
                        <p className="text-sm text-purple-100/70 leading-relaxed">{item.detail}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            <footer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-purple-100/60">
              <div className="flex flex-wrap items-center gap-2">
                <span>© {new Date().getFullYear()} Nexus AI. All rights reserved.</span>
                <div className="flex items-center gap-2 text-[11px] text-purple-100/70">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <svg
                      aria-hidden
                      viewBox="0 0 256 256"
                      className="h-3.5 w-3.5"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="128" cy="128" r="24" fill="#61DAFB" />
                      <ellipse cx="128" cy="128" rx="80" ry="32" stroke="#61DAFB" strokeWidth="12" />
                      <ellipse cx="128" cy="128" rx="32" ry="80" stroke="#61DAFB" strokeWidth="12" transform="rotate(60 128 128)" />
                      <ellipse cx="128" cy="128" rx="32" ry="80" stroke="#61DAFB" strokeWidth="12" transform="rotate(120 128 128)" />
                    </svg>
                    Built with React
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                    <svg aria-hidden viewBox="0 0 256 256" className="h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M128 32L16 224h224L128 32Z" fill="currentColor" />
                    </svg>
                    Deployed on Vercel
                  </span>
                </div>
                <span className="text-[10px] text-purple-100/50">Built and developed by Tanish Modh.</span>
              </div>
              <a
                href="https://github.com/defTPmodh"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-purple-100/80 hover:border-purple-400/40 hover:text-purple-100 transition"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit defTPmodh on GitHub"
              >
                <Github className="w-5 h-5" strokeWidth={1.75} />
              </a>
            </footer>
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
                {[
                  {
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
              {[
                {
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
                },
              ].map((card) => (
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
