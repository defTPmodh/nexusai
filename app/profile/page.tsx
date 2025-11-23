'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
  Bell,
  Palette,
  MapPin,
  Clock,
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
  role?: string | null;
  created_at?: string;
  updated_at?: string;
}

const preferenceDefaults = {
  notifications: true,
  productUpdates: true,
  securityAlerts: true,
};

export default function ProfilePage() {
  const { user: auth0User } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, boolean>>(preferenceDefaults);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    department: '',
    position: '',
    bio: '',
    avatarUrl: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!auth0User) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || auth0User.name || '',
          phone: data.phone || '',
          company: data.company || '',
          department: data.department || '',
          position: data.position || '',
          bio: data.bio || '',
          avatarUrl: data.avatar_url || auth0User.picture || '',
        });
        setPreferences({
          ...preferenceDefaults,
          ...(data.preferences || {}),
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [auth0User]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avatar_url: formData.avatarUrl,
          preferences,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
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

  const completionScore = useMemo(() => {
    const fields = ['name', 'phone', 'company', 'department', 'position', 'bio'] as const;
    const filled = fields.filter((key) => Boolean((formData as any)[key])).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  const preferenceList = [
    {
      key: 'notifications',
      title: 'Notifications',
      description: 'Task completions, mentions, and collaboration updates.',
    },
    {
      key: 'productUpdates',
      title: 'Product updates',
      description: 'Major launches, roadmap previews, and design refreshes.',
    },
    {
      key: 'securityAlerts',
      title: 'Security alerts',
      description: 'Login alerts, admin changes, and sensitive activity.',
    },
  ];

  const activity = [
    { label: 'New policy applied', time: '2h ago', detail: 'SSO enforced for workspace' },
    { label: 'Usage synced', time: '8h ago', detail: 'Spend and limits refreshed' },
    { label: 'Guardrail audit', time: 'Yesterday', detail: 'PII filters verified' },
  ];

  if (loading) {
    return (
      <div className="h-screen flex bg-[#05060f]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-white/70 animate-pulse">Preparing your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#05060f] text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 relative overflow-hidden">
        <div className="absolute inset-0 profile-grid" />
        <div className="absolute inset-0 aurora-veil" />
        <div className="absolute -left-24 -top-24 w-96 h-96 pulse-orb from-emerald-500/25 via-cyan-500/15 to-violet-500/20" />
        <div className="absolute -right-16 top-20 w-80 h-80 pulse-orb from-purple-600/20 via-indigo-500/15 to-sky-500/10" />

        <main className="relative z-10 flex-1 overflow-y-auto px-10 py-12 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-emerald-200/80">
                <Sparkles className="w-4 h-4" />
                Profile tuned for the new experience
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-cyan-500/30 to-violet-500/30 flex items-center justify-center neon-border"
                  style={formData.avatarUrl ? { backgroundImage: `url(${formData.avatarUrl})`, backgroundSize: 'cover' } : undefined}
                >
                  {!formData.avatarUrl && <User className="w-7 h-7 text-white" />}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-emerald-200/70">Identity</p>
                  <h1 className="text-3xl font-semibold">{formData.name || auth0User?.name || 'Your profile'}</h1>
                  <p className="text-white/60">{profile?.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
              <div className="glass-card rounded-2xl p-4 min-w-[220px] neon-border">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Profile health</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-semibold text-emerald-200">{completionScore}%</p>
                    <p className="text-sm text-white/60">Completed</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-200" />
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4 min-w-[220px] neon-border">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Membership</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{profile?.role ? profile.role : 'Team member'}</p>
                    <p className="text-xs text-white/60">Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'recently'}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">Workspace</div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="glass-card rounded-2xl p-6 neon-border">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Personal information</h2>
                      <p className="text-sm text-white/60">Craft how teammates see and reach you.</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-sm text-white/60">
                    <MapPin className="w-4 h-4" />
                    Global workspace
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email address
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/70 cursor-not-allowed"
                    />
                    <p className="text-xs text-white/50">Email is managed by SSO and cannot be changed.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <User className="w-4 h-4" /> Full name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        let value = e.target.value;
                        value = value.replace(/[^\d+]/g, '');
                        if (!value.startsWith('+')) {
                          if (value.startsWith('971')) {
                            value = '+' + value;
                          } else if (value) {
                            value = '+971' + value;
                          }
                        }
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
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-xs text-white/50">UAE format: +971 XX XXX XXXX</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <Building className="w-4 h-4" /> Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Enter your company name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <Building className="w-4 h-4" /> Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Enter your department"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Position / Job title
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Enter your job title"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Share what you’re building and how you like to collaborate"
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 resize-none"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-white/60 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Avatar URL
                    </label>
                    <input
                      type="url"
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      placeholder="https://"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-xs text-white/50">Use a square image URL for the best glass avatar result.</p>
                  </div>
                </div>

                <div className="pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-white/60 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Last updated {profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : 'moments ago'}
                  </div>
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 text-black rounded-xl font-semibold shadow-[0_12px_40px_rgba(34,211,238,0.25)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                          <Save className="w-4 h-4" />
                        </motion.div>
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4" /> Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" /> Save changes
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 neon-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Preferences</h3>
                      <p className="text-sm text-white/60">Fine-tune how you hear from Nexus.</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-200 text-xs border border-emerald-400/30">Live</div>
                </div>

                <div className="space-y-4">
                  {preferenceList.map((pref) => (
                    <div key={pref.key} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <p className="font-medium">{pref.title}</p>
                        <p className="text-sm text-white/60">{pref.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreferences((prev) => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          preferences[pref.key] ? 'bg-emerald-400/70' : 'bg-white/10'
                        }`}
                        aria-pressed={preferences[pref.key]}
                        aria-label={`Toggle ${pref.title}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            preferences[pref.key] ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 neon-border space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Realtime status</h3>
                    <p className="text-sm text-white/60">Signals to keep you in control.</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span>Account integrity</span>
                    <span className="text-emerald-200 font-semibold">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Multi-factor login</span>
                    <span className="text-emerald-200 font-semibold">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Workspace guardrails</span>
                    <span className="text-cyan-200 font-semibold">On</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notification cadence</span>
                    <span className="text-white/60">Adaptive</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 neon-border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Recent activity</h3>
                    <p className="text-sm text-white/60">A calm stream of what changed.</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {activity.map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-white/60">{item.detail}</p>
                        <p className="text-xs text-white/40 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
