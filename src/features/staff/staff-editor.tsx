"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  changeStaffRoleAction,
  removeStaffAction,
  setStaffStatusAction,
} from "./actions";
import type { AssignableRole, StaffUser } from "./types";

const STATUS_LABEL = { active: "פעיל", inactive: "מושבת" } as const;

/** עריכת משתמש-צוות במודאל: שינוי תפקיד + הפעלה/השבתה. */
export function StaffEditor({
  staff,
  roles,
  isSelf,
  onDone,
}: {
  staff: StaffUser;
  roles: AssignableRole[];
  isSelf: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [roleId, setRoleId] = useState(staff.role_id ?? "");
  const [error, setError] = useState<string | null>(null);

  function run(
    action: (fd: FormData) => Promise<void>,
    fields: Record<string, string>,
    after?: () => void,
  ) {
    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) formData.set(k, v);
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        after?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה");
      }
    });
  }

  if (isSelf) {
    return (
      <p className="text-text-muted text-sm">
        זהו המשתמש שלך — לא ניתן לשנות לעצמך תפקיד או סטטוס.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="text-text-muted flex flex-col gap-1 text-xs">
        תפקיד
        <div className="flex gap-2">
          <SearchableSelect
            value={roleId}
            onChange={setRoleId}
            options={roles.map((r) => ({ value: r.id, label: r.name }))}
            placeholder="תפקיד…"
            searchPlaceholder="חיפוש תפקיד…"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !roleId || roleId === staff.role_id}
            className="shrink-0"
            onClick={() =>
              run(changeStaffRoleAction, { userId: staff.id, roleId })
            }
          >
            שמירה
          </Button>
        </div>
      </label>

      <div className="border-border flex items-center justify-between gap-2 border-t pt-4">
        <span className="text-text-muted text-xs">
          סטטוס: {STATUS_LABEL[staff.status]}
        </span>
        {staff.status === "active" ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() =>
              run(
                setStaffStatusAction,
                { userId: staff.id, status: "inactive" },
                onDone,
              )
            }
          >
            השבתה
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() =>
              run(
                setStaffStatusAction,
                { userId: staff.id, status: "active" },
                onDone,
              )
            }
          >
            הפעלה
          </Button>
        )}
      </div>

      <div className="border-border flex items-center justify-between gap-2 border-t pt-4">
        <span className="text-text-muted text-xs">
          הסרה מוחקת את המשתמש וגישתו לצמיתות.
        </span>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => {
            if (
              confirm(
                `להסיר את ${staff.full_name ?? staff.email}? הפעולה בלתי הפיכה.`,
              )
            ) {
              run(removeStaffAction, { userId: staff.id }, onDone);
            }
          }}
        >
          הסרת משתמש
        </Button>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}
