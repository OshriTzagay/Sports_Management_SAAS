"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { RowModal } from "@/components/ui/row-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Team } from "@/features/teams";
import { CoachTeamAssignments } from "./coach-team-assignments";
import { EditCoachForm } from "./edit-coach-form";
import {
  COACH_ROLE_LABELS,
  COACH_STATUS_LABELS,
  type Coach,
  type CoachAssignment,
} from "./types";

function LicenseCell({ expiry }: { expiry: string | null }) {
  if (!expiry) return <span className="text-text-muted">—</span>;
  const expired = new Date(expiry) < new Date();
  const label = new Date(expiry).toLocaleDateString("he-IL");
  return expired ? (
    <Badge variant="danger">פג {label}</Badge>
  ) : (
    <span className="text-text-muted">{label}</span>
  );
}

interface CoachListProps {
  coaches: Coach[];
  seasonId: string | null;
  teams: Team[];
  assignmentsByCoach: Record<string, CoachAssignment[]>;
}

export function CoachList({
  coaches,
  seasonId,
  teams,
  assignmentsByCoach,
}: CoachListProps) {
  const [selected, setSelected] = useState<Coach | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (coach: Coach) => {
    setSelected(coach);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  if (coaches.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין מאמנים.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>תוקף רישיון</TableHead>
            <TableHead>קבוצות (עונה)</TableHead>
            <TableHead className="text-end">סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coaches.map((coach) => {
            const assignments = assignmentsByCoach[coach.id] ?? [];
            return (
              <TableRow
                key={coach.id}
                onClick={() => open(coach)}
                className="cursor-pointer"
              >
                <TableCell className="text-text-primary font-medium">
                  {coach.first_name} {coach.last_name}
                </TableCell>
                <TableCell className="text-text-muted">
                  {coach.phone ?? "—"}
                </TableCell>
                <TableCell>
                  <LicenseCell expiry={coach.license_expiry} />
                </TableCell>
                <TableCell>
                  {assignments.length === 0 ? (
                    <span className="text-text-muted">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {assignments.map((a) => (
                        <span
                          key={a.id}
                          className="bg-primary-50 text-primary-700 rounded-sm px-2 py-0.5 text-xs"
                        >
                          {a.team_name} · {COACH_ROLE_LABELS[a.role]}
                        </span>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-end">
                  <Badge
                    variant={coach.status === "active" ? "success" : "muted"}
                  >
                    {COACH_STATUS_LABELS[coach.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <RowModal dialogRef={dialogRef} title="עריכת מאמן" onClose={close}>
        {selected && (
          <div className="flex flex-col gap-4">
            <EditCoachForm key={selected.id} coach={selected} onClose={close} />
            {seasonId && (
              <div className="border-border flex flex-col gap-2 border-t pt-4">
                <span className="text-text-muted text-xs">
                  שיוך לקבוצות (בעונה הפעילה)
                </span>
                <CoachTeamAssignments
                  coachId={selected.id}
                  seasonId={seasonId}
                  teams={teams}
                  assignments={assignmentsByCoach[selected.id] ?? []}
                />
              </div>
            )}
          </div>
        )}
      </RowModal>
    </>
  );
}
