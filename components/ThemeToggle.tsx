'use client';

import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const baseStyle =
    theme === 'dark'
      ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
      : 'border-black/15 bg-white text-black hover:bg-black/[0.03]';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${baseStyle} ${className}`}
      aria-label="Toggle theme"
      title="Toggle dark/light mode"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </motion.button>
  );
}
