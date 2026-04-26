import React from 'react';
import { cn } from '../lib/utils';
import { Wallet } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 w-12 h-12 shrink-0", className)}>
      <Wallet className="w-8 h-8 text-white" />
    </div>
  );
}
