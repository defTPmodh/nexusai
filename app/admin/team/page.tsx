'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Users, UserPlus, Mail, Crown, Shield, User as UserIcon, Trash2, Copy, Check, DollarSign, TrendingUp, LogOut, ArrowUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TeamMember {
  id: string;
  role: string;
  joined_at: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  token: string;
  invited_by: {
    name: string | null;
    email: string;
  } | null;
}

export default function TeamPage() {
  const { user } = useUser();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [spending, setSpending] = useState<any[]>([]);
  const [loadingSpending, setLoadingSpending] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchSpending = useCallback(async () => {
    if (!team) return;
    setLoadingSpending(true);
    try {
      const res = await fetch(`/api/teams/spending?teamId=${team.id}`);
      if (res.ok) {
        const data = await res.json();
        setSpending(data.spending || []);
      }
    } catch (error) {
      console.error('Failed to fetch spending:', error);
    } finally {
      setLoadingSpending(false);
    }
  }, [team]);

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    try {
      const teamRes = await fetch('/api/teams');
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeam(teamData.team);

        if (teamData.team) {
          const membersRes = await fetch(`/api/teams/members?teamId=${teamData.team.id}`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            setMembers(membersData.members || []);
          }

          const invitesRes = await fetch(`/api/teams/invitations?teamId=${teamData.team.id}`);
          if (invitesRes.ok) {
            const invitesData = await invitesRes.json();
            setInvitations(invitesData.invitations || []);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user, fetchTeamData]);

  useEffect(() => {
    if (team && members.length > 0) {
      const currentUserRole = members.find(m => m.user.email === user?.email)?.role || 'member';
      if (currentUserRole === 'owner') {
        fetchSpending();
      }
    }
  }, [team, members, user, fetchSpending]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    if (!team) return;

    try {
      const res = await fetch(`/api/teams/members?teamId=${team.id}&memberId=${memberId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTeamData();
      } else {
        const data = await res.json();
        alert(`Failed to remove member: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Failed to remove member: ${error.message}`);
    }
  };

  const handlePromoteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to promote ${memberName} to admin? They will have full admin access.`)) return;
    if (!team) return;

    try {
      const res = await fetch(`/api/teams/members?teamId=${team.id}&memberId=${memberId}`, {
        method: 'PUT',
      });

      if (res.ok) {
        alert('Member promoted to admin successfully!');
        fetchTeamData();
      } else {
        const data = await res.json();
        alert(`Failed to promote member: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Failed to promote member: ${error.message}`);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    setCreatingTeam(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName: 'premium',
          teamName: teamName.trim()
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Team created successfully! Redirecting...');
        window.location.href = '/admin/team';
      } else {
        if (data.error?.includes('plan') || data.error?.includes('subscription')) {
          alert('Please purchase a premium plan first. Redirecting to pricing...');
          window.location.href = '/pricing';
        } else {
          alert(`Failed to create team: ${data.error}`);
        }
      }
    } catch (error: any) {
      alert(`Failed to create team: ${error.message}`);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team? You will lose access to all team features.')) return;
    if (!team) return;

    try {
      const res = await fetch('/api/teams/leave', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        alert('Successfully left the team. Redirecting...');
        window.location.href = '/';
      } else {
        alert(`Failed to leave team: ${data.error}`);
      }
    } catch (error: any) {
      alert(`Failed to leave team: ${error.message}`);
    }
  };

  const copyInviteLink = async (invitationId: string, token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedToken(invitationId);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedToken(invitationId);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const shimmer = "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_55%)] before:opacity-70 before:blur-3xl before:animate-pulse before:-z-10";

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-[#05060a] via-[#0a0a12] to-[#05060a] relative overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="relative z-10">
            <Loading size="lg" text="Loading your team space..." />
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex bg-gradient-to-br from-[#05060a] via-[#0a0a12] to-[#05060a] overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-25" />
          <div className={`relative z-10 w-full max-w-xl mx-auto text-center px-6 py-10 glass-card border border-purple-500/20 rounded-2xl shadow-2xl ${shimmer}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-100 text-xs mb-3">
              <Crown className="w-4 h-4" />
              Team Workspace
            </div>
            <h2 className="text-3xl font-semibold gradient-text mb-3">Craft your first team</h2>
            <p className="text-purple-200/70 mb-6">Spin up a premium workspace with invites, permissions, and rich analytics in minutes.</p>

            {!showCreateModal ? (
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all glow-purple"
                >
                  Create Team
                </motion.button>
                <Link
                  href="/pricing"
                  className="px-5 py-3 rounded-xl border border-purple-500/30 text-purple-100 bg-purple-500/5 hover:border-purple-400/50 hover:bg-purple-500/10 transition"
                >
                  View plans
                </Link>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-purple-500/25 rounded-xl p-6 mt-4 text-left"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Name your workspace</h3>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={`${user?.name || user?.email?.split('@')[0] || 'My'}'s Team`}
                  className="w-full mb-4 glass-card border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creatingTeam) {
                      handleCreateTeam();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowCreateModal(false);
                      setTeamName('');
                    }}
                    disabled={creatingTeam}
                    className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium border border-purple-500/20 hover:border-purple-400/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: creatingTeam ? 1 : 1.03 }}
                    whileTap={{ scale: creatingTeam ? 1 : 0.97 }}
                    onClick={handleCreateTeam}
                    disabled={creatingTeam}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-purple flex items-center justify-center gap-2"
                  >
                    {creatingTeam ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Users className="w-4 h-4" />
                        </motion.div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Launch workspace
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentUserRole = members.find(m => m.user.email === user?.email)?.role || 'member';
  const canManage = currentUserRole === 'owner';
  const inviteCount = invitations.length;
  const activeInvites = invitations.filter((invite) => invite.status === 'pending').length;

  return (
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-[#05060a] via-[#0b0c14] to-[#05060a] text-white relative">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-25" />
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <header className="relative z-10 px-10 pt-10 pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-cyan-900/20 shadow-xl">
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_10%_20%,rgba(129,140,248,0.35),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.25),transparent_25%)]" />
              <div className="relative px-8 py-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-100 text-xs">
                    <Shield className="w-4 h-4" />
                    Secure workspace
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-3xl font-semibold gradient-text leading-tight">{team.name}</h1>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-400/40 text-purple-50">
                      {team.plan?.display_name || 'Premium'} Plan
                    </span>
                    {team.max_members && (
                      <span className="text-xs text-purple-200/70">
                        {team.member_count} / {team.max_members} seats
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-purple-200/80 max-w-2xl">
                    Bring your team together with curated access, beautiful invites, and transparent spend. Everything inherits the new React-styled UI so it feels cohesive with chat.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {canManage && (
                      <motion.button
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => document.getElementById('invite-email')?.focus()}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/35 transition glow-purple flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Invite teammate
                      </motion.button>
                    )}
                    {currentUserRole !== 'owner' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLeaveTeam}
                        className="px-4 py-2 rounded-lg border border-red-500/40 text-red-300 bg-red-500/10 hover:bg-red-500/15 transition flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Leave team
                      </motion.button>
                    )}
                    <Link
                      href="/admin/billing"
                      className="px-4 py-2 rounded-lg border border-purple-500/30 text-purple-100 bg-purple-500/5 hover:border-purple-400/50 hover:bg-purple-500/10 transition flex items-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Billing & limits
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                  <div className="glass-card border border-purple-500/30 rounded-xl px-4 py-3">
                    <p className="text-xs text-purple-200/60 mb-1">Members</p>
                    <p className="text-2xl font-semibold text-white">{members.length}</p>
                    <p className="text-[11px] text-purple-200/50">{team.member_count} active</p>
                  </div>
                  <div className="glass-card border border-purple-500/30 rounded-xl px-4 py-3">
                    <p className="text-xs text-purple-200/60 mb-1">Invites</p>
                    <p className="text-2xl font-semibold text-white">{activeInvites}</p>
                    <p className="text-[11px] text-purple-200/50">{inviteCount} total</p>
                  </div>
                  <div className="glass-card border border-purple-500/30 rounded-xl px-4 py-3">
                    <p className="text-xs text-purple-200/60 mb-1">Plan</p>
                    <p className="text-2xl font-semibold text-white">{team.plan?.display_name || 'Premium'}</p>
                    <p className="text-[11px] text-purple-200/50">Up to {team.max_members || '∞'} seats</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto px-6 pb-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              {canManage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border border-purple-500/25 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-purple-300" />
                      <h2 className="text-lg font-semibold">Send an invite</h2>
                    </div>
                    <span className="text-xs text-purple-200/60">Instant links auto-expire</span>
                  </div>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!inviteEmail.trim() || !team) return;

                      try {
                        setInviting(true);
                        const res = await fetch('/api/teams/invite', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: inviteEmail.trim(),
                            role: inviteRole,
                            teamId: team.id,
                          }),
                        });

                        const data = await res.json();

                        if (res.ok) {
                          setInviteEmail('');
                          fetchTeamData();
                        } else {
                          alert(`Failed to send invitation: ${data.error}`);
                        }
                      } catch (error: any) {
                        alert(`Failed to send invitation: ${error.message}`);
                      } finally {
                        setInviting(false);
                      }
                    }}
                    className="flex flex-col md:flex-row md:items-center gap-3"
                  >
                    <input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@email.com"
                      className="flex-1 glass-card border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20"
                      required
                    />
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                        className="glass-card border border-purple-500/30 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20 w-full md:w-32"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <motion.button
                        type="submit"
                        disabled={inviting || !inviteEmail.trim()}
                        whileHover={{ scale: inviting ? 1 : 1.03 }}
                        whileTap={{ scale: inviting ? 1 : 0.97 }}
                        className="whitespace-nowrap px-5 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/35 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-purple"
                      >
                        {inviting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <UserPlus className="w-4 h-4" />
                            </motion.div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Send invite
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </motion.div>
              )}

              <div className="glass-card border border-purple-500/25 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-300" />
                    Team Members
                  </h2>
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-500/15 border border-purple-500/30 text-purple-100">
                    {members.length} active
                  </span>
                </div>

                <div className="grid gap-3">
                  {members.map((member) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card border border-purple-500/20 rounded-xl p-4 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-600/30 to-indigo-500/30 rounded-full flex items-center justify-center border border-purple-400/30">
                          {member.role === 'owner' ? (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          ) : member.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-purple-100" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-purple-100" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-semibold leading-tight">{member.user.name || member.user.email}</div>
                          <div className="text-sm text-purple-200/70">{member.user.email}</div>
                          <div className={`inline-flex mt-2 px-3 py-1 rounded-full text-[11px] capitalize border ${
                            member.role === 'owner'
                              ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40'
                              : member.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-100 border-purple-400/40'
                              : 'bg-purple-900/30 text-purple-200 border-purple-500/25'
                          }`}>
                            {member.role}
                          </div>
                        </div>
                      </div>

                      {canManage && member.role !== 'owner' && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {member.user.role !== 'admin' && (
                            <motion.button
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => handlePromoteMember(member.id, member.user.name || member.user.email)}
                              className="p-2 rounded-lg border border-green-500/40 text-green-200 hover:bg-green-500/10 transition"
                              title="Promote to admin"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-2 rounded-lg border border-red-500/40 text-red-300 hover:bg-red-500/10 transition"
                            title="Remove member from team"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {members.length === 0 && (
                  <div className="glass-card border border-purple-500/20 rounded-xl p-6 text-center text-purple-200/70">
                    <UserPlus className="w-10 h-10 text-purple-300/50 mx-auto mb-3" />
                    Invite your first teammate to get started.
                  </div>
                )}
              </div>

              {canManage && (
                <div className="glass-card border border-purple-500/25 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-300" />
                      <h3 className="text-lg font-semibold text-white">Pending Invitations</h3>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-100 border border-purple-500/30">
                      {inviteCount} open
                    </span>
                  </div>

                  {invitations.length === 0 ? (
                    <div className="text-purple-200/70">No pending invitations</div>
                  ) : (
                    <div className="grid gap-3">
                      {invitations.map((invitation) => (
                        <motion.div
                          key={invitation.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card border border-purple-500/20 rounded-xl p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200 flex items-center justify-center">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{invitation.email}</div>
                              <div className="text-sm text-purple-200/70">Invited as {invitation.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="px-3 py-1 rounded-full text-xs capitalize bg-purple-900/30 text-purple-200 border border-purple-500/30">
                              {invitation.status}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => copyInviteLink(invitation.id, invitation.token)}
                              className="px-4 py-2 glass-card border border-purple-500/30 rounded-lg text-sm text-purple-200 hover:border-purple-400/50 hover:bg-purple-500/10 transition-all flex items-center gap-2"
                            >
                              {copiedToken === invitation.id ? (
                                <>
                                  <Check className="w-4 h-4 text-green-400" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  Copy Link
                                </>
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {canManage && (
              <aside className="space-y-6">
                <div className="glass-card border border-purple-500/25 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-purple-300" />
                    <h3 className="text-lg font-semibold">Spending</h3>
                  </div>
                  {loadingSpending ? (
                    <div className="glass-card border border-purple-500/20 rounded-xl p-6 text-center">
                      <Loading size="sm" text="Loading spending data..." />
                    </div>
                  ) : spending.length > 0 ? (
                    <div className="glass-card border border-purple-500/20 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-purple-500/20">
                              <th className="text-left py-3 px-4 text-purple-200/70 font-medium">Member</th>
                              <th className="text-left py-3 px-4 text-purple-200/70 font-medium">Plan</th>
                              <th className="text-right py-3 px-4 text-purple-200/70 font-medium">Remaining</th>
                              <th className="text-right py-3 px-4 text-purple-200/70 font-medium">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {spending.map((member: any, idx: number) => (
                              <motion.tr
                                key={member.userId}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    {member.isOwner && <Crown className="w-4 h-4 text-yellow-400" />}
                                    <div>
                                      <div className="text-white font-medium text-sm">{member.name || member.email}</div>
                                      <div className="text-[11px] text-purple-300/60">{member.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${
                                    member.isPremium || member.isOwner
                                      ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-400/30'
                                      : 'bg-purple-900/30 text-purple-200/70 border-purple-500/20'
                                  }`}>
                                    {member.plan}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className={`text-sm font-semibold ${
                                    member.remainingCredits < member.creditLimit * 0.1
                                      ? 'text-red-400'
                                      : member.remainingCredits < member.creditLimit * 0.3
                                      ? 'text-yellow-400'
                                      : 'text-cyan-300'
                                  }`}>
                                    {member.remainingCredits.toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right gradient-text-cyan font-semibold text-sm">
                                  ${member.totalCost.toFixed(2)}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card border border-purple-500/20 rounded-xl p-6 text-center">
                      <TrendingUp className="w-10 h-10 text-purple-300/50 mx-auto mb-3" />
                      <p className="text-purple-200/70">No spending data available yet</p>
                      <p className="text-xs text-purple-300/50 mt-1">Team members need to start using the chat to see spending</p>
                    </div>
                  )}
                </div>

                <div className="glass-card border border-purple-500/25 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-sm text-purple-200/70">
                    <Shield className="w-4 h-4" />
                    Owner actions
                  </div>
                  <p className="text-purple-200/80 text-sm mb-4">Manage seats, promote teammates, and keep billing aligned without leaving the workspace.</p>
                  <ul className="space-y-2 text-sm text-purple-200/80">
                    <li className="flex items-center gap-2"><ArrowUp className="w-4 h-4 text-purple-200" /> Elevate admins to manage invites</li>
                    <li className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-200" /> Track member caps in real time</li>
                    <li className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-200" /> Review spend by seat instantly</li>
                  </ul>
                </div>
              </aside>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
