'use client';

import { useState } from 'react';
import { Check, Sparkles, Crown, Building2, ArrowRight, Mail, Loader } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PricingPage() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const plans = [
    {
      name: 'free',
      displayName: 'Free',
      price: 0,
      currency: 'AED',
      period: 'forever',
      description: 'Perfect for trying out Nexus-AI',
      features: [
        '100,000 tokens/month',
        'Basic chat with AI models',
        'RAG document upload (10 docs)',
        'Image generation',
        'Community support',
      ],
      cta: 'Current Plan',
      ctaType: 'secondary',
      icon: Sparkles,
    },
    {
      name: 'premium',
      displayName: 'Premium',
      price: 19.99,
      currency: 'AED',
      period: 'per user/month',
      description: 'Best for growing teams',
      features: [
        '1,000,000 tokens/month',
        'All AI models',
        'Unlimited document uploads',
        'Priority support',
        'Advanced analytics',
        'Up to 100 team members',
      ],
      cta: 'Upgrade to Premium',
      ctaType: 'primary',
      icon: Crown,
      popular: true,
    },
    {
      name: 'enterprise',
      displayName: 'Enterprise',
      price: null,
      currency: 'AED',
      period: 'custom pricing',
      description: 'For large organizations',
      features: [
        'Everything in Premium',
        'Unlimited team members',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Custom model training',
        'On-premise deployment option',
      ],
      cta: 'Contact Sales',
      ctaType: 'enterprise',
      icon: Building2,
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]">
      <Sidebar />
      
      <div className="flex-1 ml-64 flex flex-col relative overflow-y-auto">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

        {/* Header */}
        <div className="relative z-10 glass-dark border-b border-purple-500/20 px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
            <p className="text-gray-400 text-lg">
              Start free, upgrade when you need more. Premium plans unlock 1M tokens and team collaboration.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <main className="relative z-10 px-8 py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredPlan(plan.name)}
                  onHoverEnd={() => setHoveredPlan(null)}
                  className={`relative glass-card border rounded-2xl p-8 transition-all duration-300 ${
                    plan.popular
                      ? 'border-purple-400/50 shadow-lg shadow-purple-500/30 scale-105 glow-purple'
                      : 'border-purple-500/20 hover:border-purple-400/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 text-white text-xs font-semibold rounded-full shadow-lg glow-purple">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.popular
                        ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 glow-purple'
                        : 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        plan.popular ? 'text-white' : 'text-purple-300'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold gradient-text">{plan.displayName}</h3>
                      <p className="text-sm text-purple-200/70">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    {plan.price === null ? (
                      <div className="text-3xl font-bold text-white">Custom</div>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-400 ml-2">{plan.currency}</span>
                      </>
                    )}
                    <div className="text-sm text-gray-400 mt-1">{plan.period}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.ctaType === 'enterprise' ? (
                    <a
                      href="mailto:sales@nexusai.com?subject=Enterprise Plan Inquiry"
                      className="block w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-center flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Contact Sales
                    </a>
                  ) : plan.ctaType === 'primary' ? (
                    <button
                      onClick={async () => {
                        setUpgrading(plan.name);
                        try {
                          const res = await fetch('/api/subscribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ planName: plan.name }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            alert('Premium plan activated! Redirecting to team page...');
                            window.location.href = '/admin/team';
                          } else {
                            alert(`Failed to upgrade: ${data.error}`);
                          }
                        } catch (error: any) {
                          alert(`Failed to upgrade: ${error.message}`);
                        } finally {
                          setUpgrading(null);
                        }
                      }}
                      disabled={upgrading === plan.name}
                      className="block w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {upgrading === plan.name ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="block w-full px-6 py-3 bg-gray-800 text-gray-500 rounded-lg font-medium cursor-not-allowed text-center"
                    >
                      {plan.cta}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-2xl font-semibold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="glass-card border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">What happens if I exceed my token limit?</h3>
                <p className="text-gray-400">Free plan users will need to wait until the next billing cycle or upgrade to Premium for a 1M token limit.</p>
              </div>
              <div className="glass-card border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Can I change plans later?</h3>
                <p className="text-gray-400">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div className="glass-card border border-purple-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">What if I need more than 100 team members?</h3>
                <p className="text-gray-400">Contact our sales team for Enterprise plans with unlimited team members and custom pricing.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

