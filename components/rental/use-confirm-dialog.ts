"use client";

import { useCallback, useRef, useState } from "react";
import type { ConfirmDialogProps } from "./confirm-dialog";

export type ConfirmOptions = Omit<
  ConfirmDialogProps,
  "open" | "onConfirm" | "onCancel"
>;

export type ConfirmState = ConfirmDialogProps | null;

export function useConfirmDialog() {
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirmState: ConfirmState = options
    ? {
        open: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
        danger: options.danger,
        onConfirm: () => close(true),
        onCancel: () => close(false),
      }
    : null;

  return { confirm, confirmState };
}
