"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/ui/form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Team } from "@/features/teams";
import { EditPlayerForm } from "./edit-player-form";
import { PlayerStatusControl } from "./player-status-control";
import { TeamAssignmentControl } from "./team-assignment-control";
import type { Player } from "./types";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("he-IL") : "—";
}

interface PlayerListProps {
  players: Player[];
  seasonId: string | null;
  teams: Team[];
  teamByPlayer: Record<string, string>;
}

export function PlayerList({
  players,
  seasonId,
  teams,
  teamByPlayer,
}: PlayerListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) =>
      `${p.first_name} ${p.last_name} ${p.national_id ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [players, query]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="חיפוש לפי שם או ת.ז.…"
        className="max-w-xs"
      />

      {players.length === 0 ? (
        <p className="text-text-muted text-sm">עדיין אין שחקנים.</p>
      ) : filtered.length === 0 ? (
        <p className="text-text-muted text-sm">לא נמצאו תוצאות.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>ת.ז.</TableHead>
              <TableHead>תאריך לידה</TableHead>
              <TableHead>קבוצה</TableHead>
              <TableHead className="text-end">סטטוס</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((player) => (
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
                <TableCell>
                  {seasonId ? (
                    <TeamAssignmentControl
                      playerId={player.id}
                      seasonId={seasonId}
                      currentTeamId={teamByPlayer[player.id] ?? null}
                      teams={teams}
                    />
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex items-center justify-end gap-2">
                    <PlayerStatusControl
                      playerId={player.id}
                      status={player.status}
                    />
                    <FormDialog
                      triggerLabel="עריכה"
                      triggerVariant="ghost"
                      triggerSize="sm"
                      title="עריכת שחקן"
                    >
                      <EditPlayerForm player={player} />
                    </FormDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
