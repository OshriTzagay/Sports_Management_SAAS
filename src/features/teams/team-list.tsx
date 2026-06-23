import { FormDialog } from "@/components/ui/form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditTeamForm } from "./edit-team-form";
import { TeamDeleteButton } from "./team-delete-button";
import type { Team } from "./types";

export function TeamList({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return <p className="text-text-muted text-sm">אין קבוצות בעונה זו.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>קבוצה</TableHead>
          <TableHead>קטגוריית גיל</TableHead>
          <TableHead className="text-end">פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.id}>
            <TableCell className="text-text-primary font-medium">
              {team.name}
            </TableCell>
            <TableCell className="text-text-muted">
              {team.age_category ?? "—"}
            </TableCell>
            <TableCell className="text-end">
              <div className="flex items-center justify-end gap-2">
                <FormDialog
                  triggerLabel="עריכה"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  title="עריכת קבוצה"
                >
                  <EditTeamForm team={team} />
                </FormDialog>
                <TeamDeleteButton teamId={team.id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
