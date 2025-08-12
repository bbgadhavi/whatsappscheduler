import React from 'react';

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g clipPath="url(#clip0_101_2)">
      {/* Outer Circle / Clock Body */}
      <circle cx="50" cy="50" r="48" fill="white" />
      
      {/* Chat Bubble Body */}
      <path d="M22 28C22 25.7909 23.7909 24 26 24H74C76.2091 24 78 25.7909 78 28V60C78 62.2091 76.2091 64 74 64H40L22 76V28Z" fill="url(#paint0_linear_101_2)"/>
      
      {/* Clock Hands */}
      <path d="M50 36V50H62" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <linearGradient id="paint0_linear_101_2" x1="50" y1="24" x2="50" y2="76" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7E57C2"/>
        <stop offset="1" stopColor="#6200EE"/>
      </linearGradient>
      <clipPath id="clip0_101_2">
        <rect width="100" height="100" rx="20" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

export default Logo;
