'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Users, UserPlus, Mail, Crown, Shield, User as UserIcon, Trash2, Copy, Check, DollarSign, TrendingUp, LogOut } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
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

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user]);

  useEffect(() => {
    if (team && members.length > 0) {
      const currentUserRole = members.find(m => m.user.email === user?.email)?.role || 'member';
      if (currentUserRole === 'owner') {
        fetchSpending();
      }
    }
  }, [team, members, user]);

  const fetchSpending = async () => {
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
  };

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // Fetch team info
      const teamRes = await fetch('/api/teams');
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeam(teamData.team);
        
        if (teamData.team) {
          // Fetch members
          const membersRes = await fetch(`/api/teams/members?teamId=${teamData.team.id}`);
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            setMembers(membersData.members || []);
          }

          // Fetch invitations
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
  };


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
      // Fallback for older browsers
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

  if (loading) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] overflow-hidden">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center relative">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
          <div className="relative z-10 text-center max-w-md w-full px-6">
            <h2 className="text-2xl font-semibold gradient-text mb-4">No Team Found</h2>
            <p className="text-purple-200/70 mb-6">Create a team to start collaborating</p>
            
            {!showCreateModal ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all glow-purple"
              >
                Create Team
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-purple-500/20 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Create Your Team</h3>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder={`${user?.name || user?.email?.split('@')[0] || 'My'}'s Team`}
                  className="w-full mb-4 glass-card border border-purple-500/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creatingTeam) {
                      handleCreateTeam();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowCreateModal(false);
                      setTeamName('');
                    }}
                    disabled={creatingTeam}
                    className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: creatingTeam ? 1 : 1.05 }}
                    whileTap={{ scale: creatingTeam ? 1 : 0.95 }}
                    onClick={handleCreateTeam}
                    disabled={creatingTeam}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-purple flex items-center justify-center gap-2"
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
                        Create Team
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
  const canManage = currentUserRole === 'owner'; // Only owners can manage team

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold gradient-text mb-1">{team.name}</h1>
              <p className="text-purple-200/70 text-sm">
                {team.plan?.display_name} Plan • {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                {team.max_members && ` / ${team.max_members} max`}
              </p>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          {/* Members Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold gradient-text flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-300" />
                Team Members ({members.length})
              </h2>
              {currentUserRole !== 'owner' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveTeam}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Leave Team
                </motion.button>
              )}
            </div>

            {/* Quick Add Member Form */}
            {canManage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card border border-purple-500/20 rounded-xl p-4 mb-4"
              >
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!inviteEmail.trim() || !team) return;
                    
                    try {
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
                    }
                  }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 glass-card border border-purple-500/30 rounded-lg px-4 py-2.5 text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20"
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                    className="glass-card border border-purple-500/30 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <motion.button
                    type="submit"
                    disabled={inviting || !inviteEmail.trim()}
                    whileHover={{ scale: inviting ? 1 : 1.05 }}
                    whileTap={{ scale: inviting ? 1 : 0.95 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-purple"
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
                        Invite
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            <div className="grid gap-4">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card border border-purple-500/20 rounded-xl p-4 flex items-center justify-between hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-full flex items-center justify-center border border-purple-400/30">
                      {member.role === 'owner' ? (
                        <Crown className="w-5 h-5 text-yellow-400" />
                      ) : member.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-purple-300" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-purple-300" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{member.user.name || member.user.email}</div>
                      <div className="text-sm text-purple-200/70">{member.user.email}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs capitalize ${
                      member.role === 'owner' 
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : member.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-purple-900/30 text-purple-200 border border-purple-500/20'
                    }`}>
                      {member.role}
                    </div>
                  </div>
                  {canManage && member.role !== 'owner' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                      title="Remove member from team"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Invitations Section */}
          {canManage && invitations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold gradient-text mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-300" />
                Pending Invitations ({invitations.filter(i => i.status === 'pending').length})
              </h2>
              <div className="grid gap-4">
                {invitations.filter(i => i.status === 'pending').map((invitation) => (
                  <motion.div
                    key={invitation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card border border-purple-500/20 rounded-xl p-4 flex items-center justify-between hover:border-purple-400/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Mail className="w-5 h-5 text-purple-300" />
                      <div>
                        <div className="text-white font-medium">{invitation.email}</div>
                        <div className="text-sm text-purple-200/70">
                          Invited {new Date(invitation.created_at).toLocaleDateString()} • 
                          Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-cyan-500/20 rounded-full text-xs text-cyan-300 capitalize border border-cyan-500/30">
                        {invitation.role}
                      </div>
                    </div>
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
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Spending Breakdown (Owners Only) */}
          {canManage && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold gradient-text mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-300" />
                Member Spending Breakdown
              </h2>
              {loadingSpending ? (
                <div className="glass-card border border-purple-500/20 rounded-xl p-8 text-center">
                  <div className="text-purple-200/70">Loading spending data...</div>
                </div>
              ) : spending.length > 0 ? (
                <div className="glass-card border border-purple-500/20 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-purple-500/20">
                          <th className="text-left py-4 px-6 text-purple-200/70 font-medium text-sm">Member</th>
                          <th className="text-left py-4 px-6 text-purple-200/70 font-medium text-sm">Plan</th>
                          <th className="text-right py-4 px-6 text-purple-200/70 font-medium text-sm">Credit Limit</th>
                          <th className="text-right py-4 px-6 text-purple-200/70 font-medium text-sm">Used</th>
                          <th className="text-right py-4 px-6 text-purple-200/70 font-medium text-sm">Remaining</th>
                          <th className="text-right py-4 px-6 text-purple-200/70 font-medium text-sm">Cost</th>
                          <th className="text-right py-4 px-6 text-purple-200/70 font-medium text-sm">Requests</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spending.map((member: any, idx: number) => (
                          <motion.tr
                            key={member.userId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {member.isOwner && <Crown className="w-4 h-4 text-yellow-400" />}
                                <div>
                                  <div className="text-white font-medium text-sm">
                                    {member.name || member.email}
                                  </div>
                                  <div className="text-xs text-purple-300/60">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                member.isPremium || member.isOwner
                                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-400/30'
                                  : 'bg-purple-900/30 text-purple-200/70 border-purple-500/20'
                              }`}>
                                {member.plan}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right text-purple-200 text-sm">
                              {member.creditLimit.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right text-purple-200 text-sm">
                              {member.totalTokens.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className={`text-sm font-medium ${
                                member.remainingCredits < member.creditLimit * 0.1
                                  ? 'text-red-400'
                                  : member.remainingCredits < member.creditLimit * 0.3
                                  ? 'text-yellow-400'
                                  : 'text-cyan-400'
                              }`}>
                                {member.remainingCredits.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right gradient-text-cyan font-semibold text-sm">
                              ${member.totalCost.toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-right text-purple-200 text-sm">
                              {member.totalRequests.toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="glass-card border border-purple-500/20 rounded-xl p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-purple-300/50 mx-auto mb-4" />
                  <p className="text-purple-200/70">No spending data available yet</p>
                  <p className="text-sm text-purple-300/50 mt-2">Team members need to start using the chat to see spending</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

