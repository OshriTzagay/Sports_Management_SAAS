"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import type { Contact, PlayerContactLink } from "@/features/contacts";
import { PlayerContacts } from "@/features/contacts/player-contacts";
import { EditPlayerForm } from "./edit-player-form";
import { isMinor } from "./age";
import { PLAYER_STATUS_LABELS, type Player, type PlayerStatus } from "./types";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("he-IL") : "—";
}

const STATUS_VARIANT: Record<PlayerStatus, "success" | "muted" | "danger"> = {
  active: "success",
  inactive: "muted",
  left: "danger",
};

interface PlayerListProps {
  players: Player[];
  seasonId: string | null;
  teams: Team[];
  teamByPlayer: Record<string, string>;
  contacts: Contact[];
  contactsByPlayer: Record<string, PlayerContactLink[]>;
  readOnly?: boolean;
}

export function PlayerList({
  players,
  seasonId,
  teams,
  teamByPlayer,
  contacts,
  contactsByPlayer,
  readOnly = false,
}: PlayerListProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Player | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const teamName = useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t.name])),
    [teams],
  );

  const open = (player: Player) => {
    if (readOnly) return;
    setSelected(player);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

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
            {filtered.map((player) => {
              const needsGuardian =
                isMinor(player.birth_date) &&
                !(contactsByPlayer[player.id] ?? []).some(
                  (l) => l.relationship !== "self",
                );
              return (
                <TableRow
                  key={player.id}
                  onClick={() => open(player)}
                  className={readOnly ? undefined : "cursor-pointer"}
                >
                  <TableCell className="text-text-primary font-medium">
                    {player.first_name} {player.last_name}
                    {needsGuardian && (
                      <span
                        title="שחקן קטין ללא איש קשר אחראי"
                        className="text-warning ms-1.5 align-middle text-xs"
                      >
                        ⚠️
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {player.national_id ?? "—"}
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {formatDate(player.birth_date)}
                  </TableCell>
                  <TableCell className="text-text-muted">
                    {teamName[teamByPlayer[player.id] ?? ""] ?? "—"}
                  </TableCell>
                  <TableCell className="text-end">
                    <Badge variant={STATUS_VARIANT[player.status]}>
                      {PLAYER_STATUS_LABELS[player.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {!readOnly && (
        <RowModal dialogRef={dialogRef} title="עריכת שחקן" onClose={close}>
          {selected && (
            <div className="flex flex-col gap-4">
              <EditPlayerForm
                key={selected.id}
                player={selected}
                seasonId={seasonId}
                teams={teams}
                currentTeamId={teamByPlayer[selected.id] ?? null}
                onClose={close}
              />
              <div className="border-border flex flex-col gap-2 border-t pt-4">
                <span className="text-text-muted text-xs">אנשי קשר</span>
                <PlayerContacts
                  playerId={selected.id}
                  links={contactsByPlayer[selected.id] ?? []}
                  contacts={contacts}
                  isMinor={isMinor(selected.birth_date)}
                />
              </div>
            </div>
          )}
        </RowModal>
      )}
    </div>
  );
}
