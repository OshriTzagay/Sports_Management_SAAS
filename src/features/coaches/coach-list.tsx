"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowModal } from "@/components/ui/row-modal";
import type { Team } from "@/features/teams";
import type { TrainingSession } from "@/features/trainings/types";
import { CoachTeamAssignments } from "./coach-team-assignments";
import { CoachTrainingsSummary } from "./coach-trainings-summary";
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
  trainingsByCoach: Record<string, TrainingSession[]>;
  readOnly?: boolean;
}

export function CoachList({
  coaches,
  seasonId,
  teams,
  assignmentsByCoach,
  trainingsByCoach,
  readOnly = false,
}: CoachListProps) {
  const [selected, setSelected] = useState<Coach | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // גם ב-read-only פותחים — כדי לצפות בסיכום האימונים (למשל גזבר/ית לתשלום).
  const open = (coach: Coach) => {
    setSelected(coach);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  const columns: DataTableColumn<Coach>[] = [
    {
      key: "name",
      header: "שם",
      cell: (c) => (
        <span className="text-text-primary font-medium">
          {c.first_name} {c.last_name}
        </span>
      ),
      sortValue: (c) => `${c.first_name} ${c.last_name}`,
    },
    {
      key: "phone",
      header: "טלפון",
      cell: (c) => <span className="text-text-muted">{c.phone ?? "—"}</span>,
      sortValue: (c) => c.phone ?? "",
    },
    {
      key: "license",
      header: "תוקף רישיון",
      cell: (c) => <LicenseCell expiry={c.license_expiry} />,
      sortValue: (c) => c.license_expiry ?? "",
    },
    {
      key: "teams",
      header: "קבוצות (עונה)",
      cell: (c) => {
        const assignments = assignmentsByCoach[c.id] ?? [];
        if (assignments.length === 0)
          return <span className="text-text-muted">—</span>;
        return (
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
        );
      },
    },
    {
      key: "status",
      header: "סטטוס",
      align: "end",
      cell: (c) => (
        <Badge variant={c.status === "active" ? "success" : "muted"}>
          {COACH_STATUS_LABELS[c.status]}
        </Badge>
      ),
      sortValue: (c) => COACH_STATUS_LABELS[c.status],
      filter: { label: "סטטוס", value: (c) => COACH_STATUS_LABELS[c.status] },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={coaches}
        rowKey={(c) => c.id}
        onRowClick={open}
        searchAccessor={(c) =>
          `${c.first_name} ${c.last_name} ${c.phone ?? ""}`
        }
        searchPlaceholder="חיפוש מאמן…"
        emptyMessage="עדיין אין מאמנים."
      />

      <RowModal
        dialogRef={dialogRef}
        title={readOnly ? "פרטי מאמן" : "עריכת מאמן"}
        onClose={close}
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {!readOnly && (
              <EditCoachForm
                key={selected.id}
                coach={selected}
                onClose={close}
              />
            )}
            {!readOnly && seasonId && (
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
            <div
              className={
                readOnly
                  ? "flex flex-col gap-2"
                  : "border-border flex flex-col gap-2 border-t pt-4"
              }
            >
              <span className="text-text-muted text-xs">
                אימונים (בעונה הנבחרת)
              </span>
              <CoachTrainingsSummary
                trainings={trainingsByCoach[selected.id] ?? []}
              />
            </div>
          </div>
        )}
      </RowModal>
    </>
  );
}
