"use client";

import { Pencil } from "lucide-react";

import { FormDialog, useDialogClose } from "@/components/ui/form-dialog";
import type { Team } from "@/features/teams";
import { EditPlayerForm } from "./edit-player-form";
import type { Player } from "./types";

interface Props {
  player: Player;
  seasonId: string | null;
  teams: Team[];
  currentTeamId: string | null;
}

function EditBody({ player, seasonId, teams, currentTeamId }: Props) {
  const close = useDialogClose();
  return (
    <EditPlayerForm
      player={player}
      seasonId={seasonId}
      teams={teams}
      currentTeamId={currentTeamId}
      onClose={close}
    />
  );
}

/** עיפרון עריכה לפרטי השחקן — פותח את טופס העריכה במודאל. */
export function PlayerEditButton(props: Props) {
  return (
    <FormDialog
      triggerLabel={
        <span className="flex items-center gap-1.5">
          <Pencil className="size-4" />
          עריכת פרטים
        </span>
      }
      triggerVariant="secondary"
      title="עריכת שחקן"
    >
      <EditBody {...props} />
    </FormDialog>
  );
}
