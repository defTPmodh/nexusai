'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, Briefcase, FileText, Save, Check } from 'lucide-react';

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
      <div className="h-screen flex bg-[#0f0f0f]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-white">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#0f0f0f] overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col relative">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>

        {/* Header */}
        <div className="relative z-10 bg-[#1a1a1a] border-b border-gray-800 px-8 py-6">
          <h1 className="text-2xl font-semibold text-white">Profile Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your personal information and preferences</p>
        </div>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          <div className="max-w-3xl">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>

              <div className="space-y-4">
                {/* Email (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
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
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">UAE format: +971 XX XXX XXXX</p>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Enter your company name"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter your department"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Position / Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Enter your job title"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <motion.button
                    onClick={handleSave}
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Save className="w-4 h-4" />
                        </motion.div>
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved!
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

