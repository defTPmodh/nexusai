'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Receipt,
  Shield,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface BillingData {
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  } | null;
  plan: {
    name: string;
    displayName: string;
    pricePerUser: number | null;
    currency: string;
  } | null;
  team: {
    id: string;
    name: string;
    memberCount: number;
  } | null;
  nextBilling: {
    date: string;
    amount: number;
    currency: string;
  } | null;
  billingHistory: Array<{
    id: string;
    status: string;
    current_period_start: string;
    current_period_end: string;
    created_at: string;
    plan: {
      display_name: string;
      price_per_user_monthly: number | null;
      currency: string;
    };
  }>;
}

export default function BillingPage() {
  const { user } = useUser();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [actionLoading, setActionLoading] = useState<'cancel' | 'restart' | null>(null);

  useEffect(() => {
    if (user) {
      fetchBilling();
    }
  }, [user]);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing');
      if (res.ok) {
        const data = await res.json();
        setBilling(data);
        setAccessDenied(false);
      } else {
        const data = await res.json();
        if (data.accessDenied || res.status === 403) {
          setAccessDenied(true);
          setBilling(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch billing:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'AED') => {
    return (
      new Intl.NumberFormat('en-AE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount) + ` ${currency.toUpperCase()}`
    );
  };

  const runSubscriptionAction = async (kind: 'cancel' | 'restart') => {
    setActionLoading(kind);
    try {
      const endpoint = kind === 'cancel' ? '/api/billing/cancel' : '/api/billing/restart';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        alert(kind === 'cancel' ? 'Subscription will cancel at period end.' : 'Subscription restarted successfully.');
        await fetchBilling();
      } else {
        alert(`Failed to ${kind}: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      alert(`Failed to ${kind}: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#0b0c0f] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.14),transparent_40%),radial-gradient(circle_at_80%_100%,rgba(99,102,241,0.14),transparent_42%)]" />
          <div className="relative z-10">
            <Loading size="lg" text="Loading billing" />
          </div>
        </div>
      </div>
    );
  }

  if (!billing || accessDenied) {
    return (
      <div className="min-h-screen flex bg-[#0b0c0f] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111319]/90 p-8"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              <Shield className="w-6 h-6 text-white/90" />
            </div>
            {accessDenied ? (
              <>
                <h2 className="text-2xl font-semibold">Access restricted</h2>
                <p className="mt-2 text-sm text-white/60">Only team owners and admins can view billing details.</p>
                <Link
                  href="/admin/team"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  Manage team
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">No billing data yet</h2>
                <p className="mt-2 text-sm text-white/60">Choose a plan to unlock usage limits and billing history.</p>
                <Link
                  href="/pricing"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90"
                >
                  View plans
                  <Sparkles className="w-4 h-4" />
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  const isFreePlan = !billing.subscription || billing.plan?.name === 'free';
  const showRestart = !billing.subscription || billing.subscription.cancelAtPeriodEnd;

  return (
    <div className="min-h-screen flex bg-[#0b0c0f] text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 relative overflow-y-auto">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_85%_85%,rgba(99,102,241,0.12),transparent_42%)]" />

        <main className="relative z-10 px-6 py-8 sm:px-10 space-y-7">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-[#111319]/90 p-6 sm:p-8"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Billing</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Simple billing, clear control.</h1>
                <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/60">
                  Manage your workspace subscription, upcoming charges, and billing history in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {showRestart ? (
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => runSubscriptionAction('restart')}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-4 py-2.5 text-sm font-medium hover:bg-white/90 disabled:opacity-60"
                  >
                    {actionLoading === 'restart' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Restart
                  </button>
                ) : (
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => {
                      if (!confirm('Cancel subscription at period end?')) return;
                      runSubscriptionAction('cancel');
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-100 hover:bg-red-500/20 disabled:opacity-60"
                  >
                    {actionLoading === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Cancel at period end
                  </button>
                )}
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  Compare plans
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Plan</p>
              <p className="mt-2 text-xl font-semibold">{billing.plan?.displayName || 'Free Plan'}</p>
              <p className="mt-1 text-sm text-white/60">{isFreePlan ? 'Starter access' : 'Premium enabled'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Workspace</p>
              <p className="mt-2 text-xl font-semibold">{billing.team?.name || 'Personal'}</p>
              <p className="mt-1 text-sm text-white/60">{billing.team?.memberCount || 1} member(s)</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Next billing</p>
              <p className="mt-2 text-xl font-semibold">{billing.nextBilling ? formatDate(billing.nextBilling.date) : 'Not scheduled'}</p>
              <p className="mt-1 text-sm text-white/60">{billing.nextBilling ? formatCurrency(billing.nextBilling.amount, billing.nextBilling.currency) : 'No pending charge'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Status</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm capitalize">
                {billing.subscription?.status === 'active' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Clock3 className="w-4 h-4 text-amber-300" />}
                {billing.subscription?.status || 'inactive'}
              </div>
              <p className="mt-1 text-sm text-white/60">{billing.subscription?.id ? `ID: ${billing.subscription.id.slice(0, 12)}...` : 'No active subscription'}</p>
            </div>
          </motion.section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-white/10 bg-[#111319]/90 p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Subscription</p>
                  <h2 className="mt-1 text-xl font-semibold">Current cycle</h2>
                </div>
                <Calendar className="w-5 h-5 text-white/70" />
              </div>

              {billing.subscription ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/45">Period start</p>
                    <p className="mt-1 text-lg font-semibold">{formatDate(billing.subscription.currentPeriodStart)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/45">Period end</p>
                    <p className="mt-1 text-lg font-semibold">{formatDate(billing.subscription.currentPeriodEnd)}</p>
                  </div>

                  {billing.subscription.cancelAtPeriodEnd && (
                    <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
                      <p className="text-sm font-medium">Cancellation scheduled</p>
                      <p className="mt-1 text-sm text-amber-100/80">Access remains active until the current period ends.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                  <CreditCard className="w-10 h-10 mx-auto text-white/35" />
                  <p className="mt-3 text-white/65">No active subscription</p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl border border-white/10 bg-[#111319]/90 p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">History</p>
                  <h2 className="mt-1 text-xl font-semibold">Recent billing records</h2>
                </div>
                <Receipt className="w-5 h-5 text-white/70" />
              </div>

              {billing.billingHistory.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                  <CreditCard className="w-10 h-10 mx-auto text-white/35" />
                  <p className="mt-3 text-white/65">No records available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {billing.billingHistory.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.02 * idx }}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.plan.display_name}</p>
                          <p className="text-xs text-white/50 mt-1">
                            {formatDate(item.current_period_start)} - {formatDate(item.current_period_end)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium capitalize">{item.status}</p>
                          <p className="text-xs text-white/50 mt-1">
                            {item.plan.price_per_user_monthly !== null
                              ? formatCurrency(Number(item.plan.price_per_user_monthly), item.plan.currency)
                              : 'Custom'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 lg:grid-cols-2"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-base font-semibold">Payment method</h3>
              <p className="mt-2 text-sm text-white/60">
                Payment details are managed by your subscription provider. Contact support if you need invoice or card help.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-5">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" /> Need support?
              </h3>
              <p className="mt-2 text-sm text-emerald-100/85">Questions about billing or limits? Reach support directly.</p>
              <Link
                href="mailto:support@nexus.ai"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                Contact support
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}
