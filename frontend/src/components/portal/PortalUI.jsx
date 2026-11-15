"use client";

import { useEffect } from "react";

export function Alert({ children, type = "error", className = "" }) {
  const styles =
    type === "success"
      ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
      : type === "warning"
        ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
        : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]";

  return (
    <div
      role="alert"
      className={`rounded-xl border px-4 py-3 text-xs sm:text-sm ${styles} ${className}`}
    >
      {children}
    </div>
  );
}

export function Panel({ children, className = "" }) {
  return (
    <section
      className={`rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function Badge({ children, variant = "neutral", className = "" }) {
  const variants = {
    neutral: "bg-[#EEF2F7] border-[#E2E8F0] text-[#475569]",
    warning: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
    success: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
    danger: "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]",
    info: "bg-[#EFF6FF] border-[#BFDBFE] text-[var(--accent)]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap shrink-0 ${
        variants[variant] || variants.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function Loading({ label = "Memuat data dari server..." }) {
  return (
    <p
      role="status"
      className="rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-8 text-center text-sm text-[#475569]"
    >
      {label}
    </p>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white",
    danger: "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
    outline:
      "border border-[#CBD5E1] bg-[#FFFFFF] text-[#0F172A] hover:bg-[#EEF2F7]",
    dangerOutline:
      "border border-[#FECACA] bg-[#FFFFFF] text-[#991B1B] hover:bg-[#FEF2F2]",
    ghost:
      "bg-transparent text-[#475569] hover:bg-[#EEF2F7] hover:text-[#0F172A]",
  };

  const sizes = {
    sm: "h-8 px-3.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        sizes[size] || sizes.md
      } ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/60 p-4 grid place-items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        className={`w-full ${maxWidth} max-h-[90dvh] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] p-6 text-[#0F172A] shadow-xl`} // taste-skill-ignore: floating dialog overlay
      >
        <div className="flex items-start justify-between gap-3">
          {title ? (
            <h2 className="text-xl font-bold text-[#0F172A]">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label="Tutup dialog"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#475569] hover:bg-[#EEF2F7] hover:text-[#0F172A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export const roleLabel = {
  ADMIN: "Administrator",
  PEMILIK_KOS: "Pemilik Kos",
  PENCARI_KOS: "Pencari Kos",
};

export const errorText = (e) =>
  e?.response?.data?.message || e?.message || "Terjadi kesalahan jaringan";
