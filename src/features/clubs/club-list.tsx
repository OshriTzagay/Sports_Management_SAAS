import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClubStatusToggle } from "./club-status-toggle";
import type { Club } from "./types";

const STATUS: Record<
  Club["status"],
  { label: string; variant: "success" | "info" | "danger" }
> = {
  active: { label: "פעיל", variant: "success" },
  trial: { label: "ניסיון", variant: "info" },
  suspended: { label: "מושעה", variant: "danger" },
};

export function ClubList({ clubs }: { clubs: Club[] }) {
  if (clubs.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין מועדונים.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>מועדון</TableHead>
          <TableHead>מזהה</TableHead>
          <TableHead>סטטוס</TableHead>
          <TableHead className="text-end">פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clubs.map((club) => (
          <TableRow key={club.id}>
            <TableCell className="text-text-primary font-medium">
              {club.name}
            </TableCell>
            <TableCell className="text-text-muted">{club.slug}</TableCell>
            <TableCell>
              <Badge variant={STATUS[club.status].variant}>
                {STATUS[club.status].label}
              </Badge>
            </TableCell>
            <TableCell className="text-end">
              <ClubStatusToggle clubId={club.id} status={club.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
