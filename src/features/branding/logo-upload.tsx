"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { uploadLogoAction, type UploadLogoState } from "./actions";

const initialState: UploadLogoState = { error: null };

export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction, pending] = useActionState(
    uploadLogoAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="לוגו המועדון"
            className="border-border size-14 rounded-full border object-cover"
          />
        ) : (
          <div className="bg-bg-muted text-text-muted flex size-14 items-center justify-center rounded-full text-xs">
            ללא
          </div>
        )}
        <input
          type="file"
          name="logo"
          accept="image/png,image/jpeg"
          className="text-text-body file:border-border file:bg-bg-surface text-sm file:me-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-sm"
        />
      </div>
      <p className="text-text-muted text-xs">PNG או JPG, עד 1MB.</p>
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      {state.ok && <p className="text-success-text text-sm">הלוגו עודכן ✓</p>}
      <Button
        type="submit"
        variant="secondary"
        disabled={pending}
        className="self-start"
      >
        {pending ? "מעלה…" : "העלאת לוגו"}
      </Button>
    </form>
  );
}
