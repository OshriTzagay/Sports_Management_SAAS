"use client";

import { Pencil } from "lucide-react";

import { FormDialog, useDialogClose } from "@/components/ui/form-dialog";
import { EditTeamForm } from "./edit-team-form";
import type { Team } from "./types";

function EditBody({ team }: { team: Team }) {
  const close = useDialogClose();
  return <EditTeamForm team={team} onClose={close} />;
}

/** עיפרון עריכה לפרטי הקבוצה — פותח את טופס העריכה במודאל. */
export function TeamEditButton({ team }: { team: Team }) {
  return (
    <FormDialog
      triggerLabel={
        <span className="flex items-center gap-1.5">
          <Pencil className="size-4" />
          עריכת פרטים
        </span>
      }
      triggerVariant="secondary"
      title="עריכת קבוצה"
    >
      <EditBody team={team} />
    </FormDialog>
  );
}
