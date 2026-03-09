'use client';

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

type FluidGlassBadgeProps = {
  children: ReactNode;
  className?: string;
};

export default function FluidGlassBadge({ children, className = '' }: FluidGlassBadgeProps) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 26, y: 50 });

  const style = useMemo(
    () =>
      ({
        '--lens-x': `${pos.x}%`,
        '--lens-y': `${pos.y}%`,
      }) as CSSProperties,
    [pos.x, pos.y]
  );

  return (
    <div
      className={`fluid-badge ${hovered ? 'is-hovered' : ''} ${className}`.trim()}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPos({
          x: Math.max(14, Math.min(86, x)),
          y: Math.max(18, Math.min(82, y)),
        });
      }}
    >
      <div className="fluid-badge__content">{children}</div>
      <div className="fluid-badge__lens">
        <div className="fluid-badge__lens-content">{children}</div>
      </div>
    </div>
  );
}
