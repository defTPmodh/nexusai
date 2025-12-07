'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { BarChart3, TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';

interface AnalyticsData {
  summary: {
    totalCost: number;
    totalRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
  };
  userBreakdown: Array<{
    user_email: string;
    total_cost: number;
    total_requests: number;
    total_tokens: number;
  }>;
  timeSeries: Array<{
    date: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const analytics = await res.json();
      
      if (res.ok) {
        // Always set data, even if empty
        setData(analytics);
      } else {
        console.error('Analytics API error:', analytics.error);
        // Set empty data structure on error
        setData({
          summary: {
            totalCost: 0,
            totalRequests: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalTokens: 0,
          },
          userBreakdown: [],
          timeSeries: [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set empty data structure on network error
      setData({
        summary: {
          totalCost: 0,
          totalRequests: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalTokens: 0,
        },
        userBreakdown: [],
        timeSeries: [],
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold gradient-text">Cost Analytics</h1>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-300" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-5 py-2.5 glass-card border border-purple-500/30 rounded-lg text-sm font-medium text-white hover:border-purple-400/50 transition-colors outline-none"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#1a1a1a]">
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          {loading ? (
            <div className="text-center py-20">
              <Loading size="md" text="Loading analytics..." />
            </div>
          ) : data ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all hover-lift"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-lg flex items-center justify-center border border-purple-400/30">
                      <DollarSign className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-purple-200/70 mb-1">Total Cost</h3>
                      <p className="text-3xl font-bold gradient-text-cyan">
                        ${data.summary.totalCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all hover-lift"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-lg flex items-center justify-center border border-cyan-400/30">
                      <Activity className="w-6 h-6 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-purple-200/70 mb-1">Total Requests</h3>
                      <p className="text-3xl font-bold gradient-text-cyan">
                        {data.summary.totalRequests.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all hover-lift"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-lg flex items-center justify-center border border-purple-400/30">
                      <TrendingUp className="w-6 h-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-purple-200/70 mb-1">Total Tokens</h3>
                      <p className="text-3xl font-bold gradient-text-purple">
                        {data.summary.totalTokens.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* User Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-purple-500/20 rounded-xl p-6 mb-8"
              >
                <h2 className="text-xl font-semibold gradient-text mb-6 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-300" />
                  User Breakdown
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="text-left py-3 px-4 text-purple-200/70 font-medium text-sm">User</th>
                        <th className="text-right py-3 px-4 text-purple-200/70 font-medium text-sm">Cost</th>
                        <th className="text-right py-3 px-4 text-purple-200/70 font-medium text-sm">Requests</th>
                        <th className="text-right py-3 px-4 text-purple-200/70 font-medium text-sm">Tokens</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.userBreakdown.map((user, idx) => (
                        <motion.tr
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-white font-medium text-sm">
                            {user.user_email || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 text-right gradient-text-cyan font-semibold">
                            ${Number(user.total_cost || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-purple-200">
                            {Number(user.total_requests || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-purple-200">
                            {Number(user.total_tokens || 0).toLocaleString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* Time Series */}
              {data.timeSeries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border border-purple-500/20 rounded-xl p-6"
                >
                  <h2 className="text-xl font-semibold gradient-text mb-6 flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-300" />
                    Usage Over Time
                  </h2>
                  <div className="space-y-3">
                    {data.timeSeries.map((point, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-4 glass-card border border-purple-500/10 rounded-lg hover:border-purple-400/30 transition-all hover-lift"
                      >
                        <span className="text-white font-medium">{point.date}</span>
                        <div className="flex gap-8">
                          <div className="text-right">
                            <div className="text-xs text-purple-300/60">Cost</div>
                            <div className="text-lg font-semibold gradient-text-cyan">${point.cost.toFixed(2)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-purple-300/60">Requests</div>
                            <div className="text-lg font-semibold text-cyan-300">{point.requests}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-purple-300/60">Tokens</div>
                            <div className="text-lg font-semibold gradient-text-purple">{point.tokens.toLocaleString()}</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="text-center py-20 glass-card border border-purple-500/20 rounded-xl">
              <BarChart3 className="w-16 h-16 text-purple-300/50 mx-auto mb-4" />
              <p className="text-purple-200/70 mb-2">No data available</p>
              <p className="text-sm text-purple-300/50 mb-4">
                Start using the chat to see analytics data here
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="glass-card border border-purple-500/20 rounded-lg p-4">
                  <div className="text-xs text-purple-300/60 mb-1">Total Cost</div>
                  <div className="text-2xl font-bold gradient-text-cyan">$0.00</div>
                </div>
                <div className="glass-card border border-purple-500/20 rounded-lg p-4">
                  <div className="text-xs text-purple-300/60 mb-1">Total Requests</div>
                  <div className="text-2xl font-bold gradient-text-purple">0</div>
                </div>
                <div className="glass-card border border-purple-500/20 rounded-lg p-4">
                  <div className="text-xs text-purple-300/60 mb-1">Total Tokens</div>
                  <div className="text-2xl font-bold gradient-text-purple">0</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
