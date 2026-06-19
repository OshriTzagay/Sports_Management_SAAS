import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoachStatusControl } from "./coach-status-control";
import type { Coach } from "./types";

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

export function CoachList({ coaches }: { coaches: Coach[] }) {
  if (coaches.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין מאמנים.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>שם</TableHead>
          <TableHead>טלפון</TableHead>
          <TableHead>הסמכה</TableHead>
          <TableHead>תוקף רישיון</TableHead>
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
            <TableCell className="text-text-muted">
              {coach.certification ?? "—"}
            </TableCell>
            <TableCell>
              <LicenseCell expiry={coach.license_expiry} />
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
