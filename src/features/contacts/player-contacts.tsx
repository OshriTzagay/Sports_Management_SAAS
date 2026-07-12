"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  addPlayerContactAction,
  removePlayerContactAction,
  setBillingContactAction,
} from "./actions";
import {
  RELATIONSHIP_LABELS,
  type Contact,
  type PlayerContactLink,
  type Relationship,
} from "./types";

const RELATIONSHIPS = Object.keys(RELATIONSHIP_LABELS) as Relationship[];
const selectClass =
  "h-10 shrink-0 rounded-md border border-border bg-bg-surface px-2 text-sm text-text-primary";

export function PlayerContacts({
  playerId,
  links,
  contacts,
  isMinor = false,
}: {
  playerId: string;
  links: PlayerContactLink[];
  contacts: Contact[];
  isMinor?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [contactId, setContactId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const linkedIds = new Set(links.map((l) => l.contact_id));
  const available = contacts.filter((c) => !linkedIds.has(c.id));

  // שחקן קטין חייב איש קשר אחראי אחד לפחות שאינו "עצמי".
  const hasGuardian = links.some((l) => l.relationship !== "self");
  const showMinorWarning = isMinor && !hasGuardian;

  function add(formData: FormData) {
    startTransition(async () => {
      const result = await addPlayerContactAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      formRef.current?.reset();
      setContactId("");
      router.refresh();
    });
  }

  function run(
    action: (fd: FormData) => Promise<void>,
    fields: Record<string, string>,
  ) {
    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) formData.set(k, v);
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {showMinorWarning && (
        <p className="bg-warning-bg text-warning-text rounded-md px-2 py-1.5 text-xs">
          ⚠️ שחקן קטין — מומלץ לשייך איש קשר אחראי (הורה/אפוטרופוס).
        </p>
      )}
      {links.length === 0 && (
        <span className="text-text-muted text-xs">אין אנשי קשר מקושרים.</span>
      )}
      <ul className="flex flex-col gap-1">
        {links.map((l) => (
          <li
            key={l.id}
            className="border-border flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-sm"
          >
            <div className="min-w-0 truncate">
              <span className="text-text-primary font-medium">
                {l.first_name} {l.last_name}
              </span>
              <span className="text-text-muted">
                {" · "}
                {RELATIONSHIP_LABELS[l.relationship]}
                {l.phone ? ` · ${l.phone}` : ""}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {l.is_billing_contact ? (
                <span className="bg-success-bg text-success-text rounded-sm px-2 py-0.5 text-xs">
                  משלם
                </span>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(setBillingContactAction, { playerId, linkId: l.id })
                  }
                  className="text-text-muted hover:text-primary-700 text-xs"
                >
                  סמן כמשלם
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                aria-label="הסר"
                onClick={() => run(removePlayerContactAction, { linkId: l.id })}
                className="text-text-muted hover:text-danger"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      {available.length > 0 ? (
        <form ref={formRef} action={add} className="flex gap-1">
          <input type="hidden" name="playerId" value={playerId} />
          <SearchableSelect
            name="contactId"
            value={contactId}
            onChange={setContactId}
            options={available.map((c) => ({
              value: c.id,
              label: `${c.first_name} ${c.last_name ?? ""}`.trim(),
            }))}
            placeholder="איש קשר…"
            searchPlaceholder="חיפוש איש קשר…"
            className="flex-1"
          />
          <select
            name="relationship"
            defaultValue="father"
            className={selectClass}
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {RELATIONSHIP_LABELS[r]}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            variant="secondary"
            disabled={pending}
            className="shrink-0"
          >
            קשר
          </Button>
        </form>
      ) : (
        <span className="text-text-muted text-xs">
          אין אנשי קשר זמינים — צור חדש במסך &quot;אנשי קשר&quot;.
        </span>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
