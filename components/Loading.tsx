'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: 40,
  md: 60,
  lg: 80,
  xl: 120,
};

export default function Loading({ 
  size = 'md', 
  className = '',
  text,
  fullScreen = false 
}: LoadingProps) {
  const dimension = sizeMap[size];

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div style={{ width: dimension, height: dimension }}>
        <DotLottieReact
          src="/animations/loading.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-white/60"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

