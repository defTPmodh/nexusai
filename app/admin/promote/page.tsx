'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function PromotePage() {
  const { user } = useUser();
  const router = useRouter();
  const [promoting, setPromoting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handlePromote = async () => {
    setPromoting(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/promote', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: 'Successfully promoted to admin! Redirecting...' });
        setTimeout(() => {
          router.push('/admin/guardrails');
        }, 2000);
      } else {
        setResult({ success: false, message: data.error || 'Failed to promote' });
      }
    } catch (error: any) {
      setResult({ success: false, message: error.message || 'Failed to promote' });
    } finally {
      setPromoting(false);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-8 py-6">
          <h1 className="text-2xl font-semibold gradient-text flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-300" />
            Promote to Admin
          </h1>
        </div>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card border border-purple-500/20 rounded-xl p-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-400/30 glow-purple"
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-semibold gradient-text mb-2">Promote Yourself to Admin</h2>
                <p className="text-purple-200/70">
                  This will update your role to &apos;admin&apos; in the database, giving you access to admin features like guardrails.
                </p>
              </div>

              {user && (
                <div className="glass-card border border-purple-500/20 rounded-lg p-4 mb-6">
                  <div className="text-sm text-purple-200/60 mb-1">Current User</div>
                  <div className="text-white font-medium">{user.email}</div>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    result.success
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.message}
                  </p>
                </motion.div>
              )}

              <motion.button
                onClick={handlePromote}
                disabled={promoting || result?.success}
                whileHover={{ scale: promoting ? 1 : 1.02 }}
                whileTap={{ scale: promoting ? 1 : 0.98 }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-purple"
              >
                {promoting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader className="w-4 h-4" />
                    </motion.div>
                    Promoting...
                  </>
                ) : result?.success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Promoted!
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Promote to Admin
                  </>
                )}
              </motion.button>

              <p className="text-xs text-purple-200/50 text-center mt-4">
                Note: This is a self-service promotion endpoint. In production, this should be restricted to existing admins only.
              </p>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

