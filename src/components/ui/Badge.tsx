import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from './Button';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'en_espera' | 'pagado' | 'impago' | 'active' | 'inactive' | 'paid' | 'pending' | 'overdue';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, status, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border',
          {
            'bg-yellow-50 text-yellow-900 border-yellow-300': status === 'en_espera' || status === 'pending',
            'bg-green-50 text-green-800 border-green-300': status === 'pagado' || status === 'paid',
            'bg-red-50 text-red-800 border-red-300': status === 'impago' || status === 'overdue',
            'bg-blue-50 text-blue-800 border-blue-300': status === 'active',
            'bg-gray-100 text-gray-800 border-gray-300': status === 'inactive',
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
