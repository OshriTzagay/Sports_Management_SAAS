import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Team } from "@/features/teams";
import { CoachStatusControl } from "./coach-status-control";
import { CoachTeamAssignments } from "./coach-team-assignments";
import type { Coach, CoachAssignment } from "./types";

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
  if (coaches.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין מאמנים.</p>;
  }

  return (
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
        {coaches.map((coach) => (
          <TableRow key={coach.id}>
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
              {seasonId ? (
                <CoachTeamAssignments
                  coachId={coach.id}
                  seasonId={seasonId}
                  teams={teams}
                  assignments={assignmentsByCoach[coach.id] ?? []}
                />
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </TableCell>
            <TableCell className="text-end">
              <div className="flex justify-end">
                <CoachStatusControl coachId={coach.id} status={coach.status} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
