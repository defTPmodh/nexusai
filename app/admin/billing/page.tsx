'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Shield,
  Receipt,
  ArrowUpRight,
  Loader2,
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
      month: 'long',
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#04060e] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.15),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(168,85,247,0.12),transparent_28%)]" />
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <div className="relative z-10">
            <Loading size="lg" text="Preparing your billing space" />
          </div>
        </div>
      </div>
    );
  }

  if (!billing || accessDenied) {
    return (
      <div className="min-h-screen flex bg-[#04060e] text-white overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.1),transparent_28%)]" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-lg w-full rounded-2xl border border-white/10 bg-black/50 p-8 text-center backdrop-blur-xl shadow-[0_30px_120px_-70px_rgba(59,130,246,0.7)]"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 via-cyan-500/30 to-violet-500/30 border border-white/10">
              <Shield className="w-6 h-6 text-emerald-200" />
            </div>
            {accessDenied ? (
              <>
                <h2 className="text-2xl font-semibold text-white">Access restricted</h2>
                <p className="text-gray-400 mt-2 mb-6">Only workspace owners and admins can view billing. Ask your owner to grant access.</p>
                <Link
                  href="/admin/team"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:border-emerald-400/40 hover:bg-emerald-400/10 transition-colors"
                >
                  Manage team access
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-white">No active billing yet</h2>
                <p className="text-gray-400 mt-2 mb-6">Choose a plan to unlock invoices, usage insights, and premium support.</p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-[1.01]"
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

  return (
    <div className="min-h-screen flex bg-[#04060e] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(52,211,153,0.14),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(59,130,246,0.13),transparent_30%),radial-gradient(circle_at_16%_78%,rgba(236,72,153,0.1),transparent_24%)]" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 sm:px-10 py-7 shadow-[0_20px_120px_-80px_rgba(16,185,129,0.7)] flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Billing
            </p>
            <h1 className="text-3xl font-semibold text-white mt-1">Billing & Subscription</h1>
            <p className="text-sm text-gray-400">Keep your workspace paid up with a sleek overview of plans, invoices, and renewals.</p>
          </div>
          {isFreePlan ? (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-transform hover:scale-[1.02]"
            >
              Upgrade plan
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100">
              <CheckCircle className="w-4 h-4" /> Auto-renews
            </div>
          )}
        </header>

        <main className="relative z-10 px-6 sm:px-10 pb-12 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent backdrop-blur-xl p-6 sm:p-8 shadow-[0_40px_140px_-70px_rgba(59,130,246,0.65)]"
          >
            <div className="absolute -left-10 -top-14 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -right-14 -bottom-14 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 p-[2px]">
                    <div className="h-full w-full rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Current plan</p>
                    <h2 className="text-2xl font-semibold text-white">{billing.plan?.displayName || 'Free Plan'}</h2>
                    {billing.team && (
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        {billing.team.name} • {billing.team.memberCount} {billing.team.memberCount === 1 ? 'member' : 'members'}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                  billing.subscription?.status === 'active'
                    ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-400/30'
                    : 'bg-gray-800/80 text-gray-300 border border-white/10'
                }`}>
                  {getStatusIcon(billing.subscription?.status || 'pending')}
                  {billing.subscription?.status === 'active' ? 'Active subscription' : 'Inactive'}
                </div>
              </div>

              {billing.subscription && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Current period</span>
                      <Calendar className="w-4 h-4 text-emerald-200" />
                    </div>
                    <p className="mt-2 text-white font-semibold leading-tight">
                      {formatDate(billing.subscription.currentPeriodStart)}
                      <br />
                      {formatDate(billing.subscription.currentPeriodEnd)}
                    </p>
                  </div>
                  {billing.nextBilling && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Next billing</span>
                        <Clock className="w-4 h-4 text-cyan-200" />
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-white font-semibold">
                        <Calendar className="w-4 h-4" />
                        {formatDate(billing.nextBilling.date)}
                      </p>
                    </div>
                  )}
                  {billing.nextBilling && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Next amount</span>
                        <DollarSign className="w-4 h-4 text-cyan-200" />
                      </div>
                      <p className="mt-2 text-white font-semibold">
                        {formatCurrency(billing.nextBilling.amount, billing.nextBilling.currency)}
                      </p>
                    </div>
                  )}
                  {!billing.nextBilling && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:col-span-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Shield className="w-4 h-4 text-emerald-200" />
                        Next billing will appear once your plan renews.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Plan</p>
                  <p className="text-lg font-semibold text-white mt-1">{billing.plan?.displayName || 'Free Plan'}</p>
                  <p className="text-sm text-emerald-100/80">{isFreePlan ? 'Enjoy essential access' : 'Premium features unlocked'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Workspace</p>
                    <p className="text-lg font-semibold text-white">{billing.team?.name || 'Personal workspace'}</p>
                    <p className="text-sm text-gray-400">{billing.team?.memberCount || 1} member(s)</p>
                  </div>
                  <Building2 className="w-10 h-10 text-cyan-200" />
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Subscription ID</p>
                  <p className="text-sm font-semibold text-white mt-1">{billing.subscription?.id || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-1">Keep this handy for support</p>
                </div>
              </div>

              {billing.subscription?.cancelAtPeriodEnd && (
                <div className="rounded-xl border border-yellow-400/40 bg-yellow-500/10 p-4 text-yellow-200 flex items-start gap-3">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="font-semibold">Scheduled to cancel</p>
                    <p className="text-sm text-yellow-100/80">Your subscription will end after this billing cycle.</p>
                  </div>
                </div>
              )}

              {billing.subscription && !billing.subscription.cancelAtPeriodEnd && (
                <div className="flex flex-wrap justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      if (!confirm('Cancel subscription at period end? It will stay active until your cycle concludes.')) return;
                      try {
                        const res = await fetch('/api/billing/cancel', { method: 'POST' });
                        const data = await res.json();
                        if (res.ok) {
                          alert('Subscription will cancel at period end.');
                          fetchBilling();
                        } else {
                          alert(`Failed to cancel: ${data.error}`);
                        }
                      } catch (error: any) {
                        alert(`Failed to cancel subscription: ${error.message}`);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/20"
                  >
                    Cancel subscription
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_120px_-80px_rgba(16,185,129,0.55)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">History</p>
                <h2 className="text-xl font-semibold text-white">Billing history</h2>
              </div>
              <Receipt className="w-5 h-5 text-cyan-200" />
            </div>

            {billing.billingHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
                <CreditCard className="w-10 h-10 text-gray-600 mb-3" />
                <p className="text-gray-400">No billing history available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {billing.billingHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-emerald-400/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gray-300" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{item.plan.display_name}</div>
                          <div className="text-xs text-gray-400">
                            {formatDate(item.current_period_start)} - {formatDate(item.current_period_end)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {item.plan.price_per_user_monthly && (
                          <div className="text-right">
                            <div className="text-white font-semibold">
                              {formatCurrency(Number(item.plan.price_per_user_monthly), item.plan.currency)}
                            </div>
                            <div className="text-[11px] text-gray-400">per month</div>
                          </div>
                        )}
                        <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/50 px-3 py-1 text-sm text-gray-200 capitalize">
                          {getStatusIcon(item.status)}
                          {item.status}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="grid gap-4 lg:grid-cols-3"
          >
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> Payment method
              </h2>
              <p className="text-sm text-gray-400">
                Payment methods are managed through your subscription provider. Contact support if you need help updating cards or invoices.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Need a hand?
              </h3>
              <p className="text-sm text-emerald-50/90 mt-1">We&apos;re here to keep billing smooth.</p>
              <Link
                href="mailto:support@nexus.ai"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:border-white/40"
              >
                Email support
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
