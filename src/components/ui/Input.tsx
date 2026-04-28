import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from './Button';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900',
          'placeholder:text-gray-500',
          'focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-danger focus:ring-danger/30 focus:border-danger text-gray-900',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
