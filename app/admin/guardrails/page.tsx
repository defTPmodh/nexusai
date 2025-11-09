'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Shield, Save, Check, X, AlertTriangle, Eye, Ban, MessageSquare } from 'lucide-react';

interface Guardrail {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  pii_types: string[];
  action: 'redact' | 'block' | 'warn';
  allowlist_patterns: string[];
  created_at: string;
  updated_at: string;
}

const PII_TYPES = [
  { value: 'ssn', label: 'SSN' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'ip_address', label: 'IP Address' },
];

const ACTIONS = [
  { value: 'redact', label: 'Redact', icon: Eye, description: 'Replace PII with [TYPE REDACTED]' },
  { value: 'block', label: 'Block', icon: Ban, description: 'Prevent request from being sent' },
  { value: 'warn', label: 'Warn', icon: AlertTriangle, description: 'Show warning but allow request' },
];

export default function GuardrailsPage() {
  const { user } = useUser();
  const [guardrails, setGuardrails] = useState<Guardrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    enabled: true,
    pii_types: [] as string[],
    action: 'redact' as 'redact' | 'block' | 'warn',
    allowlist_patterns: [''] as string[],
  });

  useEffect(() => {
    if (user) {
      fetchGuardrails();
    }
  }, [user]);

  const fetchGuardrails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/guardrails');
      
      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type');
      let data: any;
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Please check if you are logged in.');
      } else {
        data = await res.json();
      }
      
      if (res.ok) {
        const defaultGuardrail = data.guardrails?.find((g: Guardrail) => g.name === 'default') || data.guardrails?.[0];
        if (defaultGuardrail) {
          setGuardrails(data.guardrails || []);
          setFormData({
            enabled: defaultGuardrail.enabled,
            pii_types: defaultGuardrail.pii_types || [],
            action: defaultGuardrail.action || 'redact',
            allowlist_patterns: defaultGuardrail.allowlist_patterns?.length > 0 
              ? defaultGuardrail.allowlist_patterns 
              : [''],
          });
        }
      } else {
        // Show error message with debug info
        console.error('Failed to fetch guardrails:', data);
        if (data.debug && data.debug.role !== 'admin') {
          setAccessDenied(true);
          setUserRole(data.debug.role);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch guardrails:', error);
      // Check if it's a JSON parse error
      if (error.message && error.message.includes('JSON')) {
        alert('Failed to load guardrails. The server may be returning an error page. Please check if you are logged in and try again.');
      } else {
        alert(`Failed to load guardrails: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/guardrails', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'default',
          ...formData,
          allowlist_patterns: formData.allowlist_patterns.filter(p => p.trim() !== ''),
        }),
      });

      // Check if response is JSON before parsing
      const contentType = res.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Please check if you are logged in.');
      }

      const responseData = await res.json();

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        fetchGuardrails();
      } else {
        let errorMsg = `Failed to save: ${responseData.error || 'Unknown error'}`;
        if (responseData.debug) {
          errorMsg += `\n\nDebug info: Your role is '${responseData.debug.role}'. You need to be a team owner to access admin features.`;
          errorMsg += `\n\nTeam owners automatically have admin access. Create a team or contact your team owner.`;
        }
        alert(errorMsg);
      }
    } catch (error: any) {
      // Check if it's a JSON parse error
      if (error.message && error.message.includes('JSON')) {
        alert('Failed to save guardrails. The server may be returning an error page. Please check if you are logged in and try again.');
      } else {
        alert(`Failed to save: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const togglePIIType = (type: string) => {
    setFormData({
      ...formData,
      pii_types: formData.pii_types.includes(type)
        ? formData.pii_types.filter(t => t !== type)
        : [...formData.pii_types, type],
    });
  };

  const addAllowlistPattern = () => {
    setFormData({
      ...formData,
      allowlist_patterns: [...formData.allowlist_patterns, ''],
    });
  };

  const removeAllowlistPattern = (index: number) => {
    setFormData({
      ...formData,
      allowlist_patterns: formData.allowlist_patterns.filter((_, i) => i !== index),
    });
  };

  const updateAllowlistPattern = (index: number, value: string) => {
    const updated = [...formData.allowlist_patterns];
    updated[index] = value;
    setFormData({ ...formData, allowlist_patterns: updated });
  };

  if (loading) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-purple-200/70">Loading guardrails...</div>
        </div>
      </div>
    );
  }

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
            Guardrails & PII Protection
          </h1>
          <p className="text-purple-200/70 text-sm mt-1">Configure PII detection rules (admins bypass these rules)</p>
        </div>

        <main className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          <div className="max-w-4xl">
            {/* Access Denied Message */}
            {accessDenied && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-400 mb-2">Admin Access Required</h3>
                    <p className="text-red-300 mb-4">
                      Your current role is: <span className="font-mono font-semibold">{userRole}</span>. 
                      You need to be a team owner to access admin features like guardrails. Team owners automatically have admin access.
                    </p>
                    <p className="text-red-200/70 text-sm">
                      Create a team or contact your team owner to get admin access.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enable/Disable */}
            {!accessDenied && (
              <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Enable Guardrails</h2>
                  <p className="text-sm text-gray-400">When enabled, PII detection rules apply to all users (except admins)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </motion.div>

            {/* PII Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">PII Types to Detect</h2>
              <p className="text-sm text-gray-400 mb-4">Select which types of personally identifiable information to detect</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PII_TYPES.map((type) => (
                  <motion.button
                    key={type.value}
                    onClick={() => togglePIIType(type.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.pii_types.includes(type.value)
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-6"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Action When PII Detected</h2>
              <p className="text-sm text-gray-400 mb-4">Choose what happens when PII is detected in user messages</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ACTIONS.map((action) => {
                  const Icon = action.icon;
                  const isSelected = formData.action === action.value;
                  return (
                    <motion.button
                      key={action.value}
                      onClick={() => setFormData({ ...formData, action: action.value as any })}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-green-400' : 'text-gray-400'}`} />
                        <span className={`font-medium ${isSelected ? 'text-green-400' : 'text-gray-300'}`}>
                          {action.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{action.description}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Allowlist Patterns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Allowlist Patterns</h2>
                  <p className="text-sm text-gray-400">Regex patterns that will bypass PII detection (e.g., company email domains)</p>
                </div>
                <motion.button
                  onClick={addAllowlistPattern}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                >
                  Add Pattern
                </motion.button>
              </div>
              <div className="space-y-2">
                {formData.allowlist_patterns.map((pattern, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => updateAllowlistPattern(index, e.target.value)}
                      placeholder="e.g., @company\.com|example@domain\.com"
                      className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 text-sm font-mono"
                    />
                    {formData.allowlist_patterns.length > 1 && (
                      <motion.button
                        onClick={() => removeAllowlistPattern(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </motion.button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="font-medium mb-1">Note for Admins</p>
                  <p>Guardrails configured here apply to all regular users. Administrators automatically bypass all PII detection and guardrails when using the chat.</p>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
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
                    Save Guardrail Settings
                  </>
                )}
              </motion.button>
            </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

