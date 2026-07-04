"use client";

import { useEffect, useRef } from "react";

export type AlertDialogProps = {
  open: boolean;
  title: string;
  message: string;
  okLabel?: string;
  danger?: boolean;
  onClose: () => void;
};

export function AlertDialog({
  open,
  title,
  message,
  okLabel = "Ойлголоо",
  danger = false,
  onClose,
}: AlertDialogProps) {
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" role="presentation" onClick={onClose}>
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-message"
        onClick={(e) => e.stopPropagation()}
      >
        <strong
          id="alert-dialog-title"
          className={`dialog__title${danger ? " dialog__title--danger" : ""}`}
        >
          {title}
        </strong>
        <p id="alert-dialog-message" className="dialog__message">
          {message}
        </p>
        <div className="dialog__actions">
          <button
            ref={okRef}
            type="button"
            className={`btn sm${danger ? " danger" : ""}`}
            onClick={onClose}
          >
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
