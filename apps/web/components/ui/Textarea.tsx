import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-mono font-medium text-[#6F6B65] uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={twMerge(
            clsx(
              'w-full p-3 text-sm rounded-[6px] border border-[#E5E0D8] bg-[#FFFFFF] text-[#191817] placeholder:text-[#6F6B65]/60 transition-colors focus:outline-none focus:border-[#B85C38] focus:ring-1 focus:ring-[#B85C38] resize-y min-h-[90px]',
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

Textarea.displayName = 'Textarea';
