'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader, Users, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function InvitePage({ params }: { params: { token: string } }) {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvitation = useCallback(async () => {
    try {
      const res = await fetch(`/api/invite/${params.token}`);
      const data = await res.json();

      if (res.ok) {
        setInvitation(data.invitation);
        setError(null);
      } else {
        setError(data.error || 'Invalid invitation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load invitation');
    } finally {
      setLoading(false);
    }
  }, [params.token]);

  useEffect(() => {
    fetchInvitation();
  }, [fetchInvitation]);

  const handleAccept = async () => {
    if (!user) {
      // Redirect to login
      router.push(`/api/auth/login?returnTo=/invite/${params.token}`);
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`/api/invite/${params.token}`, {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to team page
        router.push('/admin/team');
      } else {
        setError(data.error || 'Failed to accept invitation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader className="w-8 h-8 text-green-400" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1a1a1a] border border-red-500/50 rounded-xl p-8 max-w-md w-full text-center"
        >
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">Invalid Invitation</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Go Home
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const canAccept = invitation.canAccept && user;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-2">Team Invitation</h2>
          <p className="text-gray-400">You&apos;ve been invited to join a team</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-6 space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Team</div>
            <div className="text-white font-medium">{invitation.team?.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Plan</div>
            <div className="text-white font-medium">{invitation.team?.plan?.display_name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Invited Email</div>
            <div className="text-white font-medium">{invitation.email}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Role</div>
            <div className="text-white font-medium capitalize">{invitation.role}</div>
          </div>
        </div>

        {!user ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-400 text-center">
              Please log in to accept this invitation
            </p>
            <Link
              href={`/api/auth/login?returnTo=/invite/${params.token}`}
              className="block w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all text-center"
            >
              Log In to Accept
            </Link>
          </div>
        ) : user.email?.toLowerCase() !== invitation.email.toLowerCase() ? (
          <div className="space-y-3">
            <p className="text-sm text-red-400 text-center">
              This invitation is for {invitation.email}, but you&apos;re logged in as {user.email}
            </p>
            <a
              href="/api/auth/logout"
              className="block w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-center"
            >
              Log Out
            </a>
          </div>
        ) : (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Accept Invitation
              </>
            )}
          </button>
        )}
      </motion.div>
    </div>
  );
}

