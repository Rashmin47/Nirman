import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono font-medium text-[#6F6B65] uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(
            clsx(
              'w-full h-9 px-3 text-sm rounded-[6px] border border-[#E5E0D8] bg-[#FFFFFF] text-[#191817] placeholder:text-[#6F6B65]/60 transition-colors focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38]',
              error && 'border-[#A4483F] focus:border-[#A4483F] focus:ring-[#A4483F]',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#A4483F] mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
