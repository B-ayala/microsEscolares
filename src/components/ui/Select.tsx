import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from './Button';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'appearance-none flex h-12 w-full rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-3 text-base text-gray-900',
            'focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus:ring-danger/30 focus:border-danger',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
