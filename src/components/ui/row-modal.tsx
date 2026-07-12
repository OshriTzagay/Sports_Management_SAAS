"use client";

import { type ReactNode, type RefObject } from "react";

import { useBrandingLogo } from "@/components/branding-logo-provider";

/** מודאל שנפתח בלחיצה על שורת טבלה, עם watermark עדין של לוגו המועדון. */
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
  const logoUrl = useBrandingLogo();

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="border-border bg-bg-surface text-text-body relative m-auto w-[min(92vw,30rem)] overflow-visible rounded-lg border p-0 shadow-lg backdrop:bg-black/40"
    >
      {logoUrl && (
        // עטיפה חתוכה כדי שהסימן-מים יישאר בגבולות הכרטיס גם כשה-dialog אינו חותך (בשביל popovers).
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 m-auto size-56 object-contain opacity-[0.05]"
          />
        </div>
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
