import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility to merge tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-primary text-white hover:bg-primary-hover focus-visible:ring-primary/40 shadow-sm':
              variant === 'primary',
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400':
              variant === 'secondary',
            'border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-primary/40':
              variant === 'outline',
            'bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400':
              variant === 'ghost',
            'bg-danger text-white hover:bg-red-700 focus-visible:ring-danger/40 shadow-sm':
              variant === 'danger',
          },
          {
            'px-3.5 py-2 text-sm min-h-[40px] gap-1.5': size === 'sm',
            'px-5 py-2.5 text-base min-h-[44px] gap-2': size === 'md',
            'px-7 py-3.5 text-lg min-h-[52px] gap-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
