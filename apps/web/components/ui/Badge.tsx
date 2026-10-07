import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'dark';
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const variants = {
    neutral: 'bg-[#E5E0D8]/60 text-[#6F6B65] border-[#E5E0D8]',
    accent: 'bg-[#B85C38]/10 text-[#B85C38] border-[#B85C38]/20',
    success: 'bg-[#3F6B50]/10 text-[#3F6B50] border-[#3F6B50]/20',
    warning: 'bg-[#A66A2C]/10 text-[#A66A2C] border-[#A66A2C]/20',
    danger: 'bg-[#A4483F]/10 text-[#A4483F] border-[#A4483F]/20',
    dark: 'bg-[#292522] text-[#F7F5F0] border-[#292522]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded-[4px] text-xs font-mono font-medium tracking-tight border',
          variants[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
}
