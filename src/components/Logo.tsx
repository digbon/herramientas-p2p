import React from 'react';
import { cn } from '../lib/utils';
import logoUrl from '../assets/Logo.svg';

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("bg-white rounded-full p-0.5 flex items-center justify-center shadow-md w-12 h-12 shrink-0", className)}>
      <img
        src={logoUrl}
        alt="Logo"
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
        {...props}
      />
    </div>
  );
}
