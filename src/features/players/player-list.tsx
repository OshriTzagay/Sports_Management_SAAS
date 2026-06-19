import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlayerStatusControl } from "./player-status-control";
import type { Player } from "./types";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("he-IL") : "—";
}

export function PlayerList({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין שחקנים.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>שם</TableHead>
          <TableHead>ת.ז.</TableHead>
          <TableHead>תאריך לידה</TableHead>
          <TableHead className="text-end">סטטוס</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell className="text-text-primary font-medium">
              {player.first_name} {player.last_name}
            </TableCell>
            <TableCell className="text-text-muted">
              {player.national_id ?? "—"}
            </TableCell>
            <TableCell className="text-text-muted">
              {formatDate(player.birth_date)}
            </TableCell>
            <TableCell className="text-end">
              <div className="flex justify-end">
                <PlayerStatusControl
                  playerId={player.id}
                  status={player.status}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
