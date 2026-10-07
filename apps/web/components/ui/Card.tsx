import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'surface' | 'subtle';
}

export function Card({ children, variant = 'surface', className, ...props }: CardProps) {
  const variants = {
    surface: 'bg-[#FFFFFF] border-[#E5E0D8]',
    subtle: 'bg-[#F7F5F0] border-[#E5E0D8]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-[8px] border p-5 transition-all',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
