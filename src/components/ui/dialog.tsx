"use client";

import { useRef, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

interface DialogProps {
  triggerLabel: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  title: string;
  children: ReactNode;
}

/** דיאלוג מודאלי נגיש מבוסס <dialog> נייטיב (focus trap + Esc + backdrop). */
export function Dialog({
  triggerLabel,
  triggerVariant = "ghost",
  triggerSize = "sm",
  title,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => ref.current?.showModal()}
      >
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="border-border bg-bg-surface text-text-body m-auto w-[min(92vw,30rem)] rounded-lg border p-0 shadow-lg backdrop:bg-black/40"
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary text-lg font-bold">{title}</h2>
            <button
              type="button"
              aria-label="סגירה"
              onClick={() => ref.current?.close()}
              className="text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
