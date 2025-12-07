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
  sm: 32,
  md: 48,
  lg: 64,
  xl: 80,
};

export default function Loading({ 
  size = 'md', 
  className = '',
  text,
  fullScreen = false 
}: LoadingProps) {
  const dimension = sizeMap[size];
  const dotSize = dimension * 0.25;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
    >
      {/* Modern Orbital Loading Animation */}
      <div 
        className="relative"
        style={{ width: dimension, height: dimension }}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            background: `conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.3), transparent)`,
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))',
          }}
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        />
        
        {/* Inner pulsing dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            x: -dotSize / 2,
            y: -dotSize / 2,
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(6, 182, 212, 1))',
            boxShadow: `0 0 ${dotSize}px rgba(139, 92, 246, 0.6), 0 0 ${dotSize * 1.5}px rgba(6, 182, 212, 0.4)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Orbiting dots */}
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute rounded-full"
            style={{
              width: dotSize * 0.6,
              height: dotSize * 0.6,
              background: `linear-gradient(135deg, rgba(${139 - index * 20}, ${92 - index * 10}, ${246 - index * 20}, 0.8), rgba(${6 - index * 5}, ${182 - index * 10}, ${212 - index * 5}, 0.8))`,
              top: '50%',
              left: '50%',
              x: -dotSize * 0.3,
              y: -dotSize * 0.3,
            }}
            animate={{
              rotate: 360,
              x: [
                -dotSize * 0.3,
                Math.cos((index * 120) * Math.PI / 180) * (dimension * 0.35) - dotSize * 0.3,
                Math.cos((index * 120) * Math.PI / 180) * (dimension * 0.35) - dotSize * 0.3,
                -dotSize * 0.3,
              ],
              y: [
                -dotSize * 0.3,
                Math.sin((index * 120) * Math.PI / 180) * (dimension * 0.35) - dotSize * 0.3,
                Math.sin((index * 120) * Math.PI / 180) * (dimension * 0.35) - dotSize * 0.3,
                -dotSize * 0.3,
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.2,
            }}
          />
        ))}
      </div>

      {/* Loading text with animated dots */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex items-center gap-1"
        >
          <span className="text-sm text-white/70 font-medium">{text}</span>
          <motion.span
            className="text-sm text-white/70"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            ...
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
}

