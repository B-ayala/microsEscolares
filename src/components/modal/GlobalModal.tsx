import { X } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';
import { cn } from '../ui/Button';

export default function GlobalModal() {
  const { isOpen, title, content, closeModal } = useModalStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
        onClick={closeModal} 
        aria-hidden="true" 
      />
      
      {/* Modal Panel */}
      <div className={cn(
        "relative w-full max-w-lg transform overflow-hidden rounded-xl bg-white text-left shadow-xl transition-all sm:my-8",
        "animate-in fade-in zoom-in-95 duration-200"
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-6 py-6 pb-8">
          {content}
        </div>
      </div>
    </div>
  );
}
