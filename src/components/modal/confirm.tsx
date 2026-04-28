import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useModalStore } from '../../store/useModalStore';

interface ConfirmDeleteOptions {
  title: string;
  message: ReactNode;
  warning?: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
}

export function openConfirmDelete({
  title,
  message,
  warning,
  confirmLabel = 'Eliminar',
  onConfirm,
}: ConfirmDeleteOptions) {
  const { openModal, closeModal } = useModalStore.getState();
  openModal(
    title,
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-full bg-red-100 p-2.5">
          <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-base text-gray-800 leading-relaxed">{message}</p>
          {warning && (
            <p className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {warning}
            </p>
          )}
          <p className="text-sm font-semibold text-red-700">Esta acción no se puede deshacer.</p>
        </div>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" size="md" onClick={closeModal} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button
          variant="danger"
          size="md"
          onClick={() => {
            onConfirm();
            closeModal();
          }}
          className="w-full sm:w-auto"
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
