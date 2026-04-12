import React from 'react';

export function SpoticsLogo({ className = "h-10 w-10" }: { className?: string }) {
  // Generate unique IDs for SVG elements to avoid conflicts when logo is rendered multiple times
  const uniqueId = React.useId();
  const logoGradientId = `logoGradient-${uniqueId}`;
  const windGradientId = `windGradient-${uniqueId}`;
  const glowId = `glow-${uniqueId}`;
  const softGlowId = `softGlow-${uniqueId}`;
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={logoGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id={windGradientId} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#10b981" opacity="0.2" />
          <stop offset="50%" stopColor="#14b8a6" opacity="0.4" />
          <stop offset="100%" stopColor="#06b6d4" opacity="0.1" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id={softGlowId}>
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Circular background - soft countryside sky */}
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill={`url(#${logoGradientId})`}
        opacity="0.12"
      />
      
      {/* Wind flow lines - representing countryside breeze */}
      <g opacity="0.3">
        {/* Top wind stream */}
        <path
          d="M 10 25 Q 30 20, 50 25 T 90 25"
          stroke={`url(#${windGradientId})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Middle wind stream */}
        <path
          d="M 5 45 Q 25 40, 45 45 T 85 48"
          stroke={`url(#${windGradientId})`}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Bottom wind stream */}
        <path
          d="M 15 65 Q 35 60, 55 63 T 95 68"
          stroke={`url(#${windGradientId})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      
      {/* Music Notes floating in the wind */}
      <g filter={`url(#${glowId})`}>
        {/* First music note - eighth note tilted left */}
        <g transform="translate(25, 30) rotate(-15)">
          {/* Note head */}
          <ellipse 
            cx="0" 
            cy="8" 
            rx="3.5" 
            ry="3" 
            fill={`url(#${logoGradientId})`}
          />
          {/* Stem */}
          <rect 
            x="3" 
            y="-6" 
            width="1.2" 
            height="14" 
            fill={`url(#${logoGradientId})`}
          />
          {/* Flag */}
          <path
            d="M 4.2 -6 Q 8 -4, 8 0 Q 6 -2, 4.2 -2"
            fill={`url(#${logoGradientId})`}
          />
        </g>
        
        {/* Second music note - quarter note tilted right */}
        <g transform="translate(50, 25) rotate(20)">
          {/* Note head */}
          <ellipse 
            cx="0" 
            cy="8" 
            rx="3.5" 
            ry="3" 
            fill="#14b8a6"
          />
          {/* Stem */}
          <rect 
            x="3" 
            y="-6" 
            width="1.2" 
            height="14" 
            fill="#14b8a6"
          />
        </g>
        
        {/* Third music note - eighth note floating center */}
        <g transform="translate(45, 50) rotate(-8)">
          {/* Note head */}
          <ellipse 
            cx="0" 
            cy="8" 
            rx="4" 
            ry="3.5" 
            fill={`url(#${logoGradientId})`}
          />
          {/* Stem */}
          <rect 
            x="3.5" 
            y="-8" 
            width="1.3" 
            height="16" 
            fill={`url(#${logoGradientId})`}
          />
          {/* Flag */}
          <path
            d="M 4.8 -8 Q 9 -6, 9 -1 Q 7 -4, 4.8 -3"
            fill={`url(#${logoGradientId})`}
          />
          <path
            d="M 4.8 -4 Q 8 -2, 8 2 Q 6 0, 4.8 1"
            fill={`url(#${logoGradientId})`}
          />
        </g>
        
        {/* Fourth music note - small note top right */}
        <g transform="translate(70, 35) rotate(25)" opacity="0.85">
          {/* Note head */}
          <ellipse 
            cx="0" 
            cy="6" 
            rx="3" 
            ry="2.5" 
            fill="#06b6d4"
          />
          {/* Stem */}
          <rect 
            x="2.5" 
            y="-6" 
            width="1" 
            height="12" 
            fill="#06b6d4"
          />
        </g>
        
        {/* Fifth music note - bottom left, smaller */}
        <g transform="translate(30, 65) rotate(-20)" opacity="0.75">
          {/* Note head */}
          <ellipse 
            cx="0" 
            cy="5" 
            rx="2.5" 
            ry="2" 
            fill="#10b981"
          />
          {/* Stem */}
          <rect 
            x="2" 
            y="-5" 
            width="0.9" 
            height="10" 
            fill="#10b981"
          />
          {/* Flag */}
          <path
            d="M 2.9 -5 Q 6 -4, 6 -1 Q 4.5 -2.5, 2.9 -2"
            fill="#10b981"
          />
        </g>
        
        {/* Sixth music note - bottom right floating */}
        <g transform="translate(65, 60) rotate(12)" opacity="0.8">
          {/* Note head */}
          <ellipse 
            cx="0" 
            cy="6" 
            rx="3" 
            ry="2.5" 
            fill="#14b8a6"
          />
          {/* Stem */}
          <rect 
            x="2.5" 
            y="-5" 
            width="1" 
            height="11" 
            fill="#14b8a6"
          />
        </g>
      </g>
      
      {/* Subtle sparkles/wind particles */}
      <g filter={`url(#${softGlowId})`} opacity="0.6">
        <circle cx="18" cy="38" r="1" fill="#10b981" />
        <circle cx="55" cy="72" r="1.2" fill="#14b8a6" />
        <circle cx="78" cy="50" r="0.8" fill="#06b6d4" />
        <circle cx="38" cy="22" r="1" fill="#14b8a6" />
        <circle cx="85" cy="28" r="0.9" fill="#10b981" />
      </g>
      
      {/* Outer subtle ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="46" 
        fill="none"
        stroke={`url(#${logoGradientId})`}
        strokeWidth="0.5"
        opacity="0.25"
      />
    </svg>
  );
}
