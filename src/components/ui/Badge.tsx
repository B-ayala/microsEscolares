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
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
          {
            // En espera - Amarillo
            'bg-yellow-50 text-yellow-800 border-yellow-200': status === 'en_espera' || status === 'pending',
            // Pagado - Verde
            'bg-green-50 text-green-700 border-green-200': status === 'pagado' || status === 'paid',
            // Impago - Rojo
            'bg-red-50 text-red-700 border-red-200': status === 'impago' || status === 'overdue',
            // Activo - Azul
            'bg-blue-50 text-blue-700 border-blue-200': status === 'active',
            // Inactivo - Gris
            'bg-gray-100 text-gray-700 border-gray-200': status === 'inactive',
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
