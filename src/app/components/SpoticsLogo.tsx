export function SpoticsLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer Circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="url(#logoGradient)"
        opacity="0.2"
      />
      
      {/* Main Circle */}
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="url(#logoGradient)"
      />
      
      {/* Sound Wave Lines */}
      <g filter="url(#glow)">
        {/* Line 1 - Short */}
        <rect 
          x="20" 
          y="40" 
          width="4" 
          height="20" 
          rx="2"
          fill="white"
          opacity="0.9"
        />
        
        {/* Line 2 - Tall */}
        <rect 
          x="30" 
          y="30" 
          width="4" 
          height="40" 
          rx="2"
          fill="white"
        />
        
        {/* Line 3 - Medium */}
        <rect 
          x="40" 
          y="35" 
          width="4" 
          height="30" 
          rx="2"
          fill="white"
          opacity="0.9"
        />
        
        {/* Line 4 - Very Tall (Center) */}
        <rect 
          x="50" 
          y="25" 
          width="4" 
          height="50" 
          rx="2"
          fill="white"
        />
        
        {/* Line 5 - Medium */}
        <rect 
          x="60" 
          y="35" 
          width="4" 
          height="30" 
          rx="2"
          fill="white"
          opacity="0.9"
        />
        
        {/* Line 6 - Tall */}
        <rect 
          x="70" 
          y="30" 
          width="4" 
          height="40" 
          rx="2"
          fill="white"
        />
        
        {/* Line 7 - Short */}
        <rect 
          x="80" 
          y="40" 
          width="4" 
          height="20" 
          rx="2"
          fill="white"
          opacity="0.9"
        />
      </g>
      
      {/* Inner Circle Accent */}
      <circle 
        cx="50" 
        cy="50" 
        r="38" 
        fill="none"
        stroke="white"
        strokeWidth="1"
        opacity="0.3"
      />
    </svg>
  );
}
