import { X } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';
import { cn } from '../ui/Button';

export default function GlobalModal() {
  const { isOpen, title, content, closeModal } = useModalStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative w-full sm:max-w-lg bg-white shadow-xl text-left',
          'rounded-t-2xl sm:rounded-xl',
          'max-h-[92dvh] sm:max-h-[calc(100vh-4rem)]',
          'flex flex-col',
          'modal-panel-enter'
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 gap-3 shrink-0">
          <h3 className="text-xl font-semibold text-gray-900 truncate">{title}</h3>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-6 pb-8 text-base text-gray-800 overflow-y-auto overscroll-contain min-h-0">
          {content}
        </div>
      </div>
    </div>
  );
}
