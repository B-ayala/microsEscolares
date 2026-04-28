import { Bus } from 'lucide-react';
import { cn } from './Button';

interface PageLoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export function PageLoader({ label = 'Cargando...', fullScreen = false }: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-5 text-center',
        fullScreen
          ? 'fixed inset-0 z-[100] min-h-screen bg-gray-50'
          : 'min-h-[60vh]',
      )}
    >
      <div className="bg-primary/10 p-6 rounded-full motion-safe:animate-pulse">
        <Bus
          className="w-14 h-14 text-primary motion-safe:animate-bus-roll"
          aria-hidden="true"
        />
      </div>
      <p className="text-lg font-semibold text-gray-800">{label}</p>
      <span className="sr-only">Cargando contenido de la página</span>
    </div>
  );
}
