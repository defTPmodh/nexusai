'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { CreditCard, Calendar, DollarSign, Users, Building2, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
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
    // Format as number with 2 decimal places, then add AED
    return new Intl.NumberFormat('en-AE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' AED';
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
      <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-white">Loading billing information...</div>
        </div>
      </div>
    );
  }

  if (!billing || accessDenied) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center relative">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
          <div className="relative z-10 text-center max-w-md px-6">
            {accessDenied ? (
              <>
                <h2 className="text-2xl font-semibold gradient-text mb-4">Access Denied</h2>
                <p className="text-purple-200/70 mb-6">
                  Only team owners and admins can view billing information. 
                  Contact your team owner to access billing details.
                </p>
                <Link
                  href="/admin/team"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all glow-purple"
                >
                  Go to Team Page
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold gradient-text mb-4">No Billing Information</h2>
                <p className="text-purple-200/70 mb-6">You don&apos;t have an active subscription</p>
                <Link
                  href="/pricing"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30"
                >
                  View Plans
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isFreePlan = !billing.subscription || billing.plan?.name === 'free';

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative overflow-y-auto">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">Billing & Subscription</h1>
              <p className="text-gray-400 text-sm">Manage your subscription and view billing history</p>
            </div>
            {isFreePlan && (
              <Link
                href="/pricing"
                className="px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>

        <main className="relative z-10 px-8 py-8">
          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border border-purple-500/20 rounded-xl p-6 mb-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Current Plan</h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {billing.plan?.displayName || 'Free Plan'}
                    </div>
                    {billing.team && (
                      <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4" />
                        {billing.team.name} • {billing.team.memberCount} {billing.team.memberCount === 1 ? 'member' : 'members'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-lg ${
                billing.subscription?.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {billing.subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>

            {billing.subscription && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-purple-500/20">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Current Period</div>
                  <div className="text-white font-medium">
                    {formatDate(billing.subscription.currentPeriodStart)} - {formatDate(billing.subscription.currentPeriodEnd)}
                  </div>
                </div>
                {billing.nextBilling && (
                  <>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Next Billing Date</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(billing.nextBilling.date)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Next Billing Amount</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(billing.nextBilling.amount, billing.nextBilling.currency)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {billing.subscription?.cancelAtPeriodEnd && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="text-sm text-yellow-400">
                  Your subscription will cancel at the end of the current billing period.
                </div>
              </div>
            )}

            {billing.subscription && !billing.subscription.cancelAtPeriodEnd && (
              <div className="mt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.')) {
                      return;
                    }
                    try {
                      const res = await fetch('/api/billing/cancel', {
                        method: 'POST',
                      });
                      const data = await res.json();
                      if (res.ok) {
                        alert('Subscription cancelled successfully. It will remain active until the end of the billing period.');
                        fetchBilling();
                      } else {
                        alert(`Failed to cancel: ${data.error}`);
                      }
                    } catch (error: any) {
                      alert(`Failed to cancel subscription: ${error.message}`);
                    }
                  }}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition-colors"
                >
                  Cancel Subscription
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Billing History */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Billing History</h2>
            {billing.billingHistory.length === 0 ? (
              <div className="glass-card border border-purple-500/20 rounded-xl p-8 text-center">
                <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
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
                    className="glass-card border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.plan.display_name}</div>
                          <div className="text-sm text-gray-400">
                            {formatDate(item.current_period_start)} - {formatDate(item.current_period_end)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {item.plan.price_per_user_monthly && (
                          <div className="text-right">
                            <div className="text-white font-medium">
                              {formatCurrency(Number(item.plan.price_per_user_monthly), item.plan.currency)}
                            </div>
                            <div className="text-xs text-gray-400">per month</div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800">
                          {getStatusIcon(item.status)}
                          <span className="text-sm text-gray-300 capitalize">{item.status}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="mt-8 glass-card border border-purple-500/20 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Method
            </h2>
            <div className="text-gray-400 text-sm">
              Payment methods are managed through your subscription provider. For questions about billing, please contact support.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

