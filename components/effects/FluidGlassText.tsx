'use client';

import { useId, useMemo, useState, type CSSProperties } from 'react';

type FluidGlassTextProps = {
  text: string;
  className?: string;
};

export default function FluidGlassText({ text, className = '' }: FluidGlassTextProps) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const filterId = useId().replace(/:/g, '');

  const style = useMemo(
    () =>
      ({ '--mx': `${pos.x}%`, '--my': `${pos.y}%` }) as CSSProperties,
    [pos.x, pos.y]
  );

  return (
    <span
      className={`fluid-glass-text ${hovered ? 'is-hovered' : ''} ${className}`.trim()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      }}
      style={style}
    >
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={hovered ? '0.015 0.03' : '0.01 0.02'}
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={hovered ? '8' : '0'} />
        </filter>
      </svg>
      <span className="fluid-glass-text__base">{text}</span>
      <span className="fluid-glass-text__glass" style={{ filter: `url(#${filterId})` }}>
        {text}
      </span>
    </span>
  );
}
