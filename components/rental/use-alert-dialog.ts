"use client";

import { useCallback, useRef, useState } from "react";
import type { AlertDialogProps } from "./alert-dialog";

export type AlertOptions = {
  title?: string;
  message: string;
  okLabel?: string;
  danger?: boolean;
};

export type AlertState = AlertDialogProps | null;

export function useAlertDialog() {
  const resolverRef = useRef<(() => void) | null>(null);
  const [options, setOptions] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((opts: AlertOptions | string): Promise<void> => {
    const next = typeof opts === "string" ? { message: opts } : opts;
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOptions(next);
    });
  }, []);

  const close = useCallback(() => {
    resolverRef.current?.();
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const alertState: AlertState = options
    ? {
        open: true,
        title: options.title ?? (options.danger ? "Алдаа" : "Анхаар"),
        message: options.message,
        okLabel: options.okLabel,
        danger: options.danger,
        onClose: close,
      }
    : null;

  return { showAlert, alertState };
}
