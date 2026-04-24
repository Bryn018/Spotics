import React from 'react';

export function SpoticsLogo({ className = "h-10 w-10" }: { className?: string }) {
  // Generate unique IDs for SVG elements to avoid conflicts when logo is rendered multiple times
  const uniqueId = React.useId();
  const gradient1Id = `gradient1-${uniqueId}`;
  const gradient2Id = `gradient2-${uniqueId}`;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradient1Id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id={gradient2Id} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Outer subtle circle */}
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={`url(#${gradient1Id})`}
        strokeWidth="1"
        opacity="0.15"
      />

      {/* Four elegant circles in a row - representing sound waves/equalizer */}
      <g transform="translate(50, 50)">
        <circle cx="-18" cy="0" r="8" fill={`url(#${gradient1Id})`} opacity="0.9" />
        <circle cx="-6" cy="0" r="8" fill={`url(#${gradient1Id})`} />
        <circle cx="6" cy="0" r="8" fill={`url(#${gradient2Id})`} />
        <circle cx="18" cy="0" r="8" fill={`url(#${gradient2Id})`} opacity="0.9" />
      </g>

      {/* Subtle wave underneath */}
      <path
        d="M 30 70 Q 40 65, 50 70 T 70 70"
        stroke={`url(#${gradient1Id})`}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Minimalist 'S' lettermark */}
      <text
        x="50"
        y="30"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill={`url(#${gradient1Id})`}
        textAnchor="middle"
        letterSpacing="1"
      >
        S
      </text>
    </svg>
  );
}