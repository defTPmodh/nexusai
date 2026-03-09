'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 36,
  md: 52,
  lg: 72,
  xl: 92,
};

export default function Loading({
  size = 'md',
  className = '',
  text,
  fullScreen = false,
}: LoadingProps) {
  const dimension = sizeMap[size];

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <motion.div
          className="absolute inset-0 rounded-full border border-white/15"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[5px] rounded-full border-2 border-transparent"
          style={{ borderTopColor: 'rgba(34, 197, 94, 0.9)', borderRightColor: 'rgba(14, 165, 233, 0.9)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-[32%] rounded-full bg-white"
          animate={{ scale: [1, 1.24, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {text && <p className="text-sm text-white/70 tracking-wide">{text}</p>}
    </motion.div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md">
      {content}
    </div>
  );
}
