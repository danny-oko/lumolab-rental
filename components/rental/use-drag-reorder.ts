"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

type UseDragReorderOptions<T> = {
  items: T[];
  getKey: (item: T) => string;
  onReorder: (items: T[]) => void | Promise<void>;
  disabled?: boolean;
};

export function useDragReorder<T>({
  items,
  getKey,
  onReorder,
  disabled = false,
}: UseDragReorderOptions<T>) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const draggingRef = useRef(false);

  const reorder = useCallback(
    (fromKey: string, toKey: string) => {
      if (fromKey === toKey) return items;
      const fromIdx = items.findIndex((item) => getKey(item) === fromKey);
      const toIdx = items.findIndex((item) => getKey(item) === toKey);
      if (fromIdx < 0 || toIdx < 0) return items;
      const next = [...items];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    },
    [getKey, items],
  );

  const getDragProps = useCallback(
    (item: T) => {
      const key = getKey(item);
      return {
        draggable: !disabled,
        onDragStart: (e: DragEvent) => {
          if (disabled) return;
          draggingRef.current = true;
          setDragKey(key);
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", key);
        },
        onDragOver: (e: DragEvent) => {
          if (disabled || !draggingRef.current) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setOverKey(key);
        },
        onDragLeave: () => {
          setOverKey((current) => (current === key ? null : current));
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          if (disabled) return;
          const fromKey = e.dataTransfer.getData("text/plain") || dragKey;
          if (!fromKey || fromKey === key) return;
          const next = reorder(fromKey, key);
          void onReorder(next);
          setDragKey(null);
          setOverKey(null);
          draggingRef.current = false;
        },
        onDragEnd: () => {
          setDragKey(null);
          setOverKey(null);
          draggingRef.current = false;
        },
        "data-drag-key": key,
        "data-dragging": dragKey === key ? true : undefined,
        "data-drag-over": overKey === key && dragKey !== key ? true : undefined,
      };
    },
    [disabled, dragKey, getKey, onReorder, overKey, reorder],
  );

  return { getDragProps, isDragging: dragKey !== null };
}
