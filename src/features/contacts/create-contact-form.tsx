"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useDialogClose } from "@/components/ui/form-dialog";
import { createContactAction, type ContactFormState } from "./actions";

const initialState: ContactFormState = { error: null };

export function CreateContactForm() {
  const close = useDialogClose();
  const [state, formAction, pending] = useActionState(
    createContactAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      close();
    }
    wasPending.current = pending;
  }, [pending, state.error, close]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input name="firstName" placeholder="שם פרטי" required />
        <Input name="lastName" placeholder="שם משפחה (אופציונלי)" />
      </div>
      <Input name="phone" placeholder="טלפון" inputMode="tel" />
      <Input name="email" type="email" placeholder="אימייל" />
      <Input
        name="nationalId"
        placeholder="ת.ז. (אופציונלי)"
        inputMode="numeric"
      />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : "איש קשר חדש"}
      </Button>
    </form>
  );
}
