"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  deleteContactAction,
  updateContactAction,
  type ContactFormState,
} from "./actions";
import type { Contact } from "./types";

const initialState: ContactFormState = { error: null };

export function EditContactForm({
  contact,
  onClose,
}: {
  contact: Contact;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateContactAction,
    initialState,
  );
  const [deleting, startDelete] = useTransition();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) onClose();
    wasPending.current = pending;
  }, [pending, state.error, onClose]);

  function handleDelete() {
    const formData = new FormData();
    formData.set("contactId", contact.id);
    startDelete(async () => {
      await deleteContactAction(formData);
      router.refresh();
      onClose();
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="contactId" value={contact.id} />
      <div className="flex gap-2">
        <Input name="firstName" defaultValue={contact.first_name} required />
        <Input
          name="lastName"
          placeholder="שם משפחה"
          defaultValue={contact.last_name ?? ""}
        />
      </div>
      <Input
        name="phone"
        placeholder="טלפון"
        defaultValue={contact.phone ?? ""}
        inputMode="tel"
      />
      <Input
        name="email"
        type="email"
        placeholder="אימייל"
        defaultValue={contact.email ?? ""}
      />
      {state.error && <p className="text-danger text-sm">{state.error}</p>}
      <div className="flex items-center justify-between">
        <Button type="submit" disabled={pending || deleting}>
          {pending ? <Spinner className="size-4" /> : "שמירה"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending || deleting}
          onClick={handleDelete}
        >
          {deleting ? <Spinner className="size-4" /> : "מחיקה"}
        </Button>
      </div>
    </form>
  );
}
