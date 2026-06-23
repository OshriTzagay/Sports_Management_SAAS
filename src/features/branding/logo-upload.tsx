"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { uploadLogoAction, type UploadLogoState } from "./actions";

const initialState: UploadLogoState = { error: null };

export function LogoUpload({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction, pending] = useActionState(
    uploadLogoAction,
    initialState,
  );
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) router.refresh();
    wasPending.current = pending;
  }, [pending, state.error, router]);

  const shown = preview ?? logoUrl;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
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
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
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
        {pending ? <Spinner className="size-4" /> : "העלאת לוגו"}
      </Button>
    </form>
  );
}
