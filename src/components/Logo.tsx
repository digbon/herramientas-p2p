import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={cn("w-10 h-10", className)} {...props}>
      <circle cx="100" cy="100" r="100" fill="#334155" />
      
      <g transform="translate(0, -5)">
        <circle cx="55" cy="75" r="22" fill="white" />
        <path d="M 20 145 C 20 100, 90 100, 90 145 Z" fill="white" />
        
        <circle cx="145" cy="75" r="22" fill="white" />
        <path d="M 180 145 C 180 100, 110 100, 110 145 Z" fill="white" />
      </g>
      
      <g transform="translate(0, 15)">
        <rect x="80" y="145" width="80" height="20" rx="10" fill="white" />
        <circle cx="80" cy="155" r="22" fill="white" />
        <path d="M 30 147 L 78 147 A 8 8 0 0 1 78 163 L 30 163 Z" fill="#334155" />
      </g>
      
      <path d="M 45 105 L 75 80 L 75 95 L 125 95 L 125 80 L 155 105 L 125 130 L 125 115 L 75 115 L 75 130 Z" fill="white" stroke="#334155" strokeWidth="8" strokeLinejoin="round" />
    </svg>
  );
}
