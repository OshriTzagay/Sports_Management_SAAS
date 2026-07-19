"use client";

import { Pencil } from "lucide-react";

import { FormDialog, useDialogClose } from "@/components/ui/form-dialog";
import { EditCoachForm } from "./edit-coach-form";
import type { Coach } from "./types";

function EditBody({ coach }: { coach: Coach }) {
  const close = useDialogClose();
  return <EditCoachForm coach={coach} onClose={close} />;
}

/** עיפרון עריכה לפרטי המאמן — פותח את טופס העריכה במודאל. */
export function CoachEditButton({ coach }: { coach: Coach }) {
  return (
    <FormDialog
      triggerLabel={
        <span className="flex items-center gap-1.5">
          <Pencil className="size-4" />
          עריכת פרטים
        </span>
      }
      triggerVariant="secondary"
      title="עריכת מאמן"
    >
      <EditBody coach={coach} />
    </FormDialog>
  );
}
