"use client";

import { type ReactNode, type RefObject } from "react";

/** מודאל שנפתח בלחיצה על שורת טבלה. הרשימה מחזיקה את ה-ref ואת מצב הבחירה. */
export function RowModal({
  dialogRef,
  title,
  onClose,
  children,
}: {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="border-border bg-bg-surface text-text-body m-auto w-[min(92vw,30rem)] rounded-lg border p-0 shadow-lg backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-text-primary text-lg font-bold">{title}</h2>
          <button
            type="button"
            aria-label="סגירה"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
