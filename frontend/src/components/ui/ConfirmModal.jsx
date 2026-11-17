'use client';

import { useEffect } from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi Tindakan',
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const confirmBtnStyle =
    variant === 'danger'
      ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
      : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white';

  return (
    <div
      onClick={() => !isLoading && onCancel?.()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-[#FFFFFF] p-6 ring-1 ring-[#E2E8F0] shadow-xl"
      >
        <h3
          id="confirm-modal-title"
          className="text-base font-bold text-[#0F172A]"
        >
          {title}
        </h3>
        {message && (
          <p className="mt-2 whitespace-pre-line text-sm text-[#475569] leading-relaxed">
            {message}
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-xl bg-[#EEF2F7] px-4 py-2 text-xs font-semibold text-[#0F172A] hover:bg-[#E2E8F0] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-semibold disabled:opacity-50 transition-colors cursor-pointer ${confirmBtnStyle}`}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
