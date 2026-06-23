import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/ui/form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditSeasonForm } from "./edit-season-form";
import { SeasonRowActions } from "./season-row-actions";
import type { Season } from "./types";

function formatRange(startsOn: string | null, endsOn: string | null): string {
  if (!startsOn && !endsOn) return "—";
  const fmt = (d: string) => new Date(d).toLocaleDateString("he-IL");
  return [startsOn && fmt(startsOn), endsOn && fmt(endsOn)]
    .filter(Boolean)
    .join(" – ");
}

function StatusBadge({ season }: { season: Season }) {
  if (season.is_active) return <Badge variant="success">● פעילה</Badge>;
  if (season.status === "closed") return <Badge variant="muted">סגורה</Badge>;
  return <Badge variant="info">לא פעילה</Badge>;
}

export function SeasonList({ seasons }: { seasons: Season[] }) {
  if (seasons.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין עונות.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>עונה</TableHead>
          <TableHead>תאריכים</TableHead>
          <TableHead>סטטוס</TableHead>
          <TableHead className="text-end">פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {seasons.map((season) => (
          <TableRow key={season.id}>
            <TableCell className="text-text-primary font-medium">
              {season.name}
            </TableCell>
            <TableCell className="text-text-muted">
              {formatRange(season.starts_on, season.ends_on)}
            </TableCell>
            <TableCell>
              <StatusBadge season={season} />
            </TableCell>
            <TableCell className="text-end">
              <div className="flex items-center justify-end gap-2">
                <SeasonRowActions season={season} />
                <FormDialog
                  triggerLabel="עריכה"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  title="עריכת עונה"
                >
                  <EditSeasonForm season={season} />
                </FormDialog>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
