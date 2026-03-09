'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Github,
  Grid,
  MessageSquare,
  Rocket,
  Route,
  Shield,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import ThemeToggle from '@/components/ThemeToggle';
import Aurora from '@/components/effects/Aurora';
import FluidGlassBadge from '@/components/effects/FluidGlassBadge';
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
        <Loading size="lg" text="Loading your workspace..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f5f5f7] text-[#1d1d1f]">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <Aurora
            colorStops={['#5227FF', '#7cff67', '#3b82f6']}
            speed={0.8}
            blend={0.45}
            className="h-full w-full"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-14 flex items-center justify-between rounded-full border border-black/10 bg-white/80 px-5 py-3 backdrop-blur-xl"
          >
            <FluidGlassBadge className="text-sm font-semibold tracking-tight">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Nexus AI</span>
              </span>
            </FluidGlassBadge>
            <div className="hidden items-center gap-8 text-sm text-black/70 md:flex">
              <Link href="/pricing" className="transition hover:text-black">Pricing</Link>
              <a href="#features" className="transition hover:text-black">Features</a>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a
                href="/api/auth/login"
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/85"
              >
                Sign In
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </motion.nav>

          <main className="space-y-24 pb-14">
            <section className="text-center">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-sm font-medium text-black/55"
              >
                Built for modern business teams
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mx-auto max-w-5xl text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
              >
                Focused AI workspace.
                <br />
                Designed to feel effortless.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mx-auto mt-6 max-w-2xl text-base text-black/65 sm:text-lg"
              >
                Nexus AI gives your team one calm place for chat, documents, and governance with clean controls and real-time visibility.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
              >
                <a href="/api/auth/login" className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/85">
                  Open Workspace
                </a>
                <Link href="/pricing" className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-black/[0.03]">
                  View Plans
                </Link>
              </motion.div>
            </section>

            <motion.section
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-[36px] border border-black/10 bg-gradient-to-b from-white to-[#ececf0] p-5 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.45)] sm:p-10"
            >
              <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-[#c8d9ff]/55 blur-3xl" aria-hidden />
              <div className="absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-[#ffd8be]/55 blur-3xl" aria-hidden />
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-black/10 bg-[#0f1115] p-6 text-white sm:p-8">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Live Overview</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Everything your team needs, without the noise.</p>
                  <div className="mt-7 grid grid-cols-3 gap-3">
                    {[
                      { label: 'Latency', value: '82ms' },
                      { label: 'Uptime', value: '99.99%' },
                      { label: 'Requests', value: '2.3M' },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/15 bg-white/5 p-3">
                        <p className="text-[11px] text-white/60">{metric.label}</p>
                        <p className="mt-1 text-xl font-semibold">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div id="features" className="space-y-3">
                  {[
                    { title: 'Secure by default', copy: 'PII guardrails, model permissions, and audit logs built in.', icon: ShieldCheck },
                    { title: 'Fast team rollout', copy: 'Role-based invites for managers, employees, and contractors.', icon: Rocket },
                    { title: 'Decision-ready insights', copy: 'Clear usage visibility across teams and plans.', icon: Activity },
                  ].map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      className="rounded-2xl border border-black/10 bg-white/75 p-4 backdrop-blur"
                    >
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-sm text-black/65">{item.copy}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            <motion.footer
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-between gap-4 border-t border-black/10 pt-8 text-xs text-black/50 sm:flex-row"
            >
              <span>© {new Date().getFullYear()} Nexus AI. All rights reserved.</span>
              <a
                href="https://github.com/defTPmodh"
                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-3 py-2 text-black/70 transition hover:text-black"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit defTPmodh on GitHub"
              >
                <Github className="h-4 w-4" strokeWidth={1.8} />
              </a>
            </motion.footer>
          </main>
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
                title: 'Team chat',
                desc: 'A focused chat space for workflows, planning, and support.',
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
                title: 'Team invites',
                desc: 'Invite managers, employees, and contractors with secure links.',
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

