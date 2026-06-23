"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Team } from "@/features/teams";
import {
  addCoachAssignmentAction,
  removeCoachAssignmentAction,
} from "./actions";
import {
  COACH_ROLE_LABELS,
  type CoachAssignment,
  type CoachRole,
} from "./types";

const ROLES = Object.keys(COACH_ROLE_LABELS) as CoachRole[];

const selectClass =
  "rounded-md border border-border bg-bg-surface px-2 py-1 text-xs text-text-primary";

export function CoachTeamAssignments({
  coachId,
  seasonId,
  teams,
  assignments,
}: {
  coachId: string;
  seasonId: string;
  teams: Team[];
  assignments: CoachAssignment[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add(formData: FormData) {
    startTransition(async () => {
      const result = await addCoachAssignmentAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      formRef.current?.reset();
      router.refresh();
    });
  }

  function remove(assignmentId: string) {
    const formData = new FormData();
    formData.set("assignmentId", assignmentId);
    startTransition(async () => {
      await removeCoachAssignmentAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {assignments.length === 0 && (
          <span className="text-text-muted text-xs">—</span>
        )}
        {assignments.map((a) => (
          <span
            key={a.id}
            className="bg-primary-50 text-primary-700 inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs"
          >
            {a.team_name} · {COACH_ROLE_LABELS[a.role]}
            <button
              type="button"
              onClick={() => remove(a.id)}
              disabled={pending}
              aria-label="הסר שיוך"
              className="hover:text-danger"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      {teams.length > 0 && (
        <form ref={formRef} action={add} className="flex gap-1">
          <input type="hidden" name="coachId" value={coachId} />
          <input type="hidden" name="seasonId" value={seasonId} />
          <select
            name="teamId"
            defaultValue=""
            required
            className={selectClass}
          >
            <option value="" disabled>
              קבוצה…
            </option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <select name="role" defaultValue="head" className={selectClass}>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {COACH_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            size="sm"
            variant="secondary"
            disabled={pending}
          >
            +
          </Button>
        </form>
      )}
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
