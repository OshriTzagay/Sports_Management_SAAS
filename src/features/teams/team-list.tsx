"use client";

import { useCallback, useRef, useState } from "react";

import { RowModal } from "@/components/ui/row-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditTeamForm } from "./edit-team-form";
import type { Team } from "./types";

export function TeamList({ teams }: { teams: Team[] }) {
  const [selected, setSelected] = useState<Team | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (team: Team) => {
    setSelected(team);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  if (teams.length === 0) {
    return <p className="text-text-muted text-sm">אין קבוצות בעונה זו.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>קבוצה</TableHead>
            <TableHead>קטגוריית גיל</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow
              key={team.id}
              onClick={() => open(team)}
              className="cursor-pointer"
            >
              <TableCell className="text-text-primary font-medium">
                {team.name}
              </TableCell>
              <TableCell className="text-text-muted">
                {team.age_category ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RowModal dialogRef={dialogRef} title="עריכת קבוצה" onClose={close}>
        {selected && (
          <EditTeamForm key={selected.id} team={selected} onClose={close} />
        )}
      </RowModal>
    </>
  );
}
