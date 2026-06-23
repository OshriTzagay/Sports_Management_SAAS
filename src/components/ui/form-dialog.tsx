"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useBrandingLogo } from "@/components/branding-logo-provider";

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
  const logoUrl = useBrandingLogo();

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
        className="border-border bg-bg-surface text-text-body relative m-auto w-[min(92vw,30rem)] overflow-hidden rounded-lg border p-0 shadow-lg backdrop:bg-black/40"
      >
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto size-56 object-contain opacity-[0.05]"
          />
        )}
        <div className="relative flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt=""
                  className="border-border size-6 rounded-full border object-cover"
                />
              )}
              <h2 className="text-text-primary text-lg font-bold">{title}</h2>
            </div>
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
