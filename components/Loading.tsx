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
  sm: 48,
  md: 72,
  lg: 96,
  xl: 120,
};

export default function Loading({ 
  size = 'md', 
  className = '',
  text,
  fullScreen = false 
}: LoadingProps) {
  const dimension = sizeMap[size];
  const ringWidth = dimension * 0.12;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center gap-6 ${className}`}
    >
      {/* Premium Multi-Layer Loading Animation */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: dimension, height: dimension }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Main rotating ring with gradient - enhanced speed variation */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: dimension,
            height: dimension,
            background: `conic-gradient(
              from 0deg,
              rgba(139, 92, 246, 0) 0%,
              rgba(139, 92, 246, 0.9) 20%,
              rgba(168, 85, 247, 1) 30%,
              rgba(6, 182, 212, 1) 50%,
              rgba(14, 165, 233, 1) 60%,
              rgba(139, 92, 246, 0.9) 80%,
              rgba(139, 92, 246, 0) 100%
            )`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ringWidth}px), black calc(100% - ${ringWidth}px))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ringWidth}px), black calc(100% - ${ringWidth}px))`,
            filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.7)) drop-shadow(0 0 24px rgba(6, 182, 212, 0.5))',
          }}
          animate={{ 
            rotate: 360,
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            rotate: {
              duration: 1,
              repeat: Infinity, 
              ease: 'linear',
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        />

        {/* Secondary inner ring (counter-rotating) */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: dimension * 0.65,
            height: dimension * 0.65,
            top: '50%',
            left: '50%',
            x: -dimension * 0.325,
            y: -dimension * 0.325,
            background: `conic-gradient(
              from 180deg,
              rgba(6, 182, 212, 0) 0%,
              rgba(6, 182, 212, 0.6) 30%,
              rgba(139, 92, 246, 0.8) 60%,
              rgba(6, 182, 212, 0.6) 90%,
              rgba(6, 182, 212, 0) 100%
            )`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ringWidth * 0.8}px), black calc(100% - ${ringWidth * 0.8}px))`,
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ringWidth * 0.8}px), black calc(100% - ${ringWidth * 0.8}px))`,
            filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))',
          }}
          animate={{ rotate: -360 }}
          transition={{ 
            duration: 1.8, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
        />
        
        {/* Pulsing center core with enhanced motion */}
        <motion.div
          className="absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: dimension * 0.3,
            height: dimension * 0.3,
            x: -dimension * 0.15,
            y: -dimension * 0.15,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(139, 92, 246, 1), rgba(6, 182, 212, 1))',
            boxShadow: `
              0 0 ${dimension * 0.2}px rgba(139, 92, 246, 0.8),
              0 0 ${dimension * 0.4}px rgba(6, 182, 212, 0.6),
              inset 0 0 ${dimension * 0.15}px rgba(255, 255, 255, 0.3)
            `,
            filter: 'blur(0.5px)',
          }}
          animate={{
            scale: [1, 1.2, 0.95, 1.15, 1],
            opacity: [0.9, 1, 0.85, 1, 0.9],
            rotate: [0, 90, 180, 270, 360],
            boxShadow: [
              `0 0 ${dimension * 0.2}px rgba(139, 92, 246, 0.8), 0 0 ${dimension * 0.4}px rgba(6, 182, 212, 0.6)`,
              `0 0 ${dimension * 0.35}px rgba(139, 92, 246, 1), 0 0 ${dimension * 0.7}px rgba(6, 182, 212, 0.9)`,
              `0 0 ${dimension * 0.15}px rgba(139, 92, 246, 0.6), 0 0 ${dimension * 0.3}px rgba(6, 182, 212, 0.5)`,
              `0 0 ${dimension * 0.35}px rgba(139, 92, 246, 1), 0 0 ${dimension * 0.7}px rgba(6, 182, 212, 0.9)`,
              `0 0 ${dimension * 0.2}px rgba(139, 92, 246, 0.8), 0 0 ${dimension * 0.4}px rgba(6, 182, 212, 0.6)`,
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Orbiting particles with enhanced motion */}
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const angle = (index * 60) * Math.PI / 180;
          const radius = dimension * 0.4;
          return (
            <motion.div
              key={index}
              className="absolute rounded-full"
              style={{
                width: dimension * 0.08,
                height: dimension * 0.08,
                top: '50%',
                left: '50%',
                background: index % 2 === 0 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(168, 85, 247, 1))'
                  : 'linear-gradient(135deg, rgba(6, 182, 212, 1), rgba(14, 165, 233, 1))',
                boxShadow: `0 0 ${dimension * 0.12}px ${index % 2 === 0 ? 'rgba(139, 92, 246, 1)' : 'rgba(6, 182, 212, 1)'}, 0 0 ${dimension * 0.2}px ${index % 2 === 0 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(6, 182, 212, 0.5)'}`,
                filter: 'blur(0.5px)',
              }}
              animate={{
                x: [
                  Math.cos(angle) * radius - dimension * 0.04,
                  Math.cos(angle + Math.PI * 2) * radius - dimension * 0.04,
                ],
                y: [
                  Math.sin(angle) * radius - dimension * 0.04,
                  Math.sin(angle + Math.PI * 2) * radius - dimension * 0.04,
                ],
                scale: [1, 1.4, 0.9, 1.2, 1],
                opacity: [0.6, 1, 0.8, 1, 0.6],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: [0.4, 0, 0.6, 1],
                delay: index * 0.15,
              }}
            />
          );
        })}

        {/* Additional inner rotating dots */}
        {[0, 1, 2].map((index) => {
          const innerAngle = (index * 120) * Math.PI / 180;
          const innerRadius = dimension * 0.25;
          return (
            <motion.div
              key={`inner-${index}`}
              className="absolute rounded-full"
              style={{
                width: dimension * 0.05,
                height: dimension * 0.05,
                top: '50%',
                left: '50%',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(139, 92, 246, 0.8))',
                boxShadow: `0 0 ${dimension * 0.08}px rgba(255, 255, 255, 0.6)`,
              }}
              animate={{
                x: [
                  Math.cos(innerAngle) * innerRadius - dimension * 0.025,
                  Math.cos(innerAngle + Math.PI * 2) * innerRadius - dimension * 0.025,
                ],
                y: [
                  Math.sin(innerAngle) * innerRadius - dimension * 0.025,
                  Math.sin(innerAngle + Math.PI * 2) * innerRadius - dimension * 0.025,
                ],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.3,
              }}
            />
          );
        })}
      </div>

      {/* Enhanced loading text */}
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold gradient-text">
              {text}
            </span>
            <motion.div
              className="flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/80 via-black/60 to-black/80 backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
        {content}
      </div>
    );
  }

  return content;
}

