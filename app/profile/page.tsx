"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  FileText,
  Save,
  Check,
  Sparkles,
  ShieldCheck,
  Clock3,
  Sparkle,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  department: string | null;
  position: string | null;
  bio: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
}

export default function ProfilePage() {
  const { user: auth0User } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    department: '',
    position: '',
    bio: '',
  });

  const planName = useMemo(() => {
    const prefPlan = (profile as any)?.preferences?.plan;
    if (typeof prefPlan === 'string' && prefPlan.length > 0) return prefPlan;
    return 'Premium';
  }, [profile]);

  const initials = useMemo(() => {
    const source = profile?.name || auth0User?.name || profile?.email || auth0User?.email;
    if (!source) return 'YOU';
    return source
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [auth0User?.email, auth0User?.name, profile?.email, profile?.name]);

  useEffect(() => {
    if (auth0User) {
      fetchProfile();
    }
  }, [auth0User]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          company: data.company || '',
          department: data.department || '',
          position: data.position || '',
          bio: data.bio || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await res.json();
        alert(`Failed to save: ${error.error}`);
      }
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex bg-[#07070a]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-purple-600/10 blur-3xl" />
          <div className="relative z-10 w-full max-w-2xl px-8">
            <div className="animate-pulse rounded-2xl border border-white/5 bg-white/5 p-8 shadow-2xl shadow-emerald-500/10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-36 rounded-full bg-white/10" />
                <div className="h-10 w-10 rounded-full bg-white/10" />
              </div>
              <div className="space-y-4">
                <div className="h-16 rounded-xl bg-white/10" />
                <div className="h-16 rounded-xl bg-white/10" />
                <div className="h-16 rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#050508] overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-purple-700/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.25),transparent_30%),radial-gradient(circle_at_10%_70%,rgba(236,72,153,0.2),transparent_30%)]" />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>

        <div className="relative z-10 bg-black/40 backdrop-blur-xl border-b border-white/5 px-10 py-8 shadow-[0_20px_120px_-50px_rgba(16,185,129,0.6)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-300/70 font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Profile
              </p>
              <h1 className="text-3xl font-semibold text-white mt-2">Tailor your workspace presence</h1>
              <p className="text-gray-400 mt-2 max-w-3xl">Refresh your public-facing details, keep teammates in sync, and let Nexus adapt to your personal style.</p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="relative"
            >
              <div className="absolute inset-0 blur-xl bg-gradient-to-br from-emerald-400/40 via-cyan-500/30 to-violet-500/30 animate-pulse" />
              <div className="relative h-14 w-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-emerald-500/30">
                {initials}
              </div>
            </motion.div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 relative z-10">
          <div className="max-w-6xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 via-white/2 to-transparent backdrop-blur-xl p-6 sm:p-8 shadow-[0_40px_120px_-60px_rgba(16,185,129,0.55)]"
            >
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-[2px]">
                      <div className="h-full w-full rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl font-semibold text-white">
                        {initials}
                      </div>
                      <span className="absolute -right-1 -bottom-1 h-6 w-6 rounded-full bg-emerald-500/90 text-black text-xs font-bold flex items-center justify-center shadow-lg shadow-emerald-500/40">
                        <Sparkle className="w-3 h-3" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        {profile?.name || auth0User?.name || 'Your profile'}
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                          <ShieldCheck className="w-4 h-4" /> Verified workspace
                        </span>
                      </h2>
                      <p className="text-sm text-gray-400">{profile?.email || auth0User?.email}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-300">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                          <Clock3 className="w-4 h-4 text-emerald-300" />
                          Last synced moments ago
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/10">
                          <Sparkles className="w-4 h-4 text-cyan-300" />
                          Plan: {planName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[{
                      label: 'Company',
                      value: formData.company || 'Add your company',
                    }, {
                      label: 'Department',
                      value: formData.department || 'Add your department',
                    }, {
                      label: 'Role',
                      value: formData.position || 'Add your role',
                    }, {
                      label: 'Phone',
                      value: formData.phone || 'Add your phone',
                    }].map((item) => (
                      <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
                        <p className="text-sm font-semibold text-white mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/50 p-4 sm:p-5 backdrop-blur-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Plan Insights</p>
                      <h3 className="text-lg font-semibold text-white mt-1">Stay ahead with Nexus</h3>
                      <p className="text-sm text-gray-400 mt-1">Craft your profile so teammates know who they are collaborating with.</p>
                    </div>
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                  </div>

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" /> Instant sync across workspace
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-cyan-400" /> Personalized assistant preferences
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-violet-400" /> Premium support response
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Workspace plan</p>
                      <p className="text-sm font-semibold text-white">{planName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Status</p>
                      <p className="text-sm font-semibold text-emerald-300">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
              className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl p-6 sm:p-8 shadow-[0_30px_120px_-70px_rgba(59,130,246,0.45)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Profile</p>
                  <h2 className="text-2xl font-semibold text-white mt-1">Personal information</h2>
                  <p className="text-sm text-gray-400 mt-2">Keep your contact details polished and ready for collaborations.</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, -2, 0, 2, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 border border-white/10"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-200" />
                </motion.div>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {/* Email (read-only) */}
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent" />
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="relative w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed backdrop-blur-xl"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Email is managed by your workspace admin.</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/60"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Remove all non-digits except +
                      value = value.replace(/[^\d+]/g, '');

                      // If starts with +, keep it, otherwise add +971
                      if (!value.startsWith('+')) {
                        if (value.startsWith('971')) {
                          value = '+' + value;
                        } else if (value) {
                          value = '+971' + value;
                        }
                      }

                      // Limit to UAE format: +971 followed by 9 digits
                      const digits = value.replace(/\D/g, '');
                      if (digits.startsWith('971')) {
                        const localNumber = digits.slice(3);
                        if (localNumber.length > 9) {
                          value = '+971 ' + localNumber.slice(0, 2) + ' ' + localNumber.slice(2, 5) + ' ' + localNumber.slice(5, 9);
                        } else if (localNumber.length > 5) {
                          value = '+971 ' + localNumber.slice(0, 2) + ' ' + localNumber.slice(2, 5) + ' ' + localNumber.slice(5);
                        } else if (localNumber.length > 2) {
                          value = '+971 ' + localNumber.slice(0, 2) + ' ' + localNumber.slice(2);
                        } else if (localNumber.length > 0) {
                          value = '+971 ' + localNumber;
                        } else {
                          value = '+971';
                        }
                      } else if (value === '+') {
                        value = '+971';
                      }

                      setFormData({ ...formData, phone: value });
                    }}
                    placeholder="+971 50 123 4567"
                    maxLength={16}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/60"
                  />
                  <p className="text-xs text-gray-500 mt-2">UAE format: +971 XX XXX XXXX</p>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Enter your company name"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/60"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter your department"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/60"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Position / Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Enter your job title"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/60"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Share how you collaborate, your specialties, and what teammates should know."
                    rows={4}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/60 resize-none"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{ scale: saving ? 1 : 0.98 }}
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-5 w-5 rounded-full border-2 border-white/60 border-t-transparent"
                      />
                      Saving changes
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved successfully
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save profile
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

