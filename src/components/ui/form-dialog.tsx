"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

const DialogCloseContext = createContext<() => void>(() => {});

/** מאפשר לטופס בתוך FormDialog לסגור את המודאל (למשל אחרי שמירה מוצלחת). */
export const useDialogClose = () => useContext(DialogCloseContext);

interface FormDialogProps {
  triggerLabel: ReactNode;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  title: string;
  children: ReactNode;
}

/** מודאל ליצירה/עדכון — כפתור פותח, התוכן (טופס) יכול לסגור דרך useDialogClose. */
export function FormDialog({
  triggerLabel,
  triggerVariant = "default",
  triggerSize = "sm",
  title,
  children,
}: FormDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useCallback(() => ref.current?.close(), []);

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
          if (e.target === ref.current) close();
        }}
        className="border-border bg-bg-surface text-text-body m-auto w-[min(92vw,30rem)] rounded-lg border p-0 shadow-lg backdrop:bg-black/40"
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-text-primary text-lg font-bold">{title}</h2>
            <button
              type="button"
              aria-label="סגירה"
              onClick={close}
              className="text-text-muted hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <DialogCloseContext.Provider value={close}>
            {children}
          </DialogCloseContext.Provider>
        </div>
      </dialog>
    </>
  );
}
