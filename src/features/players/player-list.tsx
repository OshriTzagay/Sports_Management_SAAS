"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { RowModal } from "@/components/ui/row-modal";
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
  payStatusByPlayer: Record<string, "paid" | "owes">;
  readOnly?: boolean;
}

export function PlayerList({
  players,
  seasonId,
  teams,
  teamByPlayer,
  contacts,
  contactsByPlayer,
  payStatusByPlayer,
  readOnly = false,
}: PlayerListProps) {
  const [selected, setSelected] = useState<Player | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const teamName = Object.fromEntries(teams.map((t) => [t.id, t.name]));
  const teamOf = (p: Player) => teamName[teamByPlayer[p.id] ?? ""] ?? "";
  const needsGuardian = (p: Player) =>
    isMinor(p.birth_date) &&
    !(contactsByPlayer[p.id] ?? []).some((l) => l.relationship !== "self");

  const open = (player: Player) => {
    if (readOnly) return;
    setSelected(player);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  const columns: DataTableColumn<Player>[] = [
    {
      key: "name",
      header: "שם",
      cell: (p) => (
        <span className="text-text-primary font-medium">
          {p.first_name} {p.last_name}
          {needsGuardian(p) && (
            <span
              title="שחקן קטין ללא איש קשר אחראי"
              className="text-warning ms-1.5 align-middle text-xs"
            >
              ⚠️
            </span>
          )}
        </span>
      ),
      sortValue: (p) => `${p.first_name} ${p.last_name}`,
    },
    {
      key: "national_id",
      header: "ת.ז.",
      cell: (p) => (
        <span className="text-text-muted">{p.national_id ?? "—"}</span>
      ),
      sortValue: (p) => p.national_id ?? "",
    },
    {
      key: "birth",
      header: "תאריך לידה",
      cell: (p) => (
        <span className="text-text-muted">{formatDate(p.birth_date)}</span>
      ),
      sortValue: (p) => p.birth_date ?? "",
    },
    {
      key: "team",
      header: "קבוצה",
      cell: (p) => <span className="text-text-muted">{teamOf(p) || "—"}</span>,
      sortValue: (p) => teamOf(p),
      filter: { label: "קבוצה", value: (p) => teamOf(p) },
    },
    {
      key: "joined",
      header: "הצטרפות",
      cell: (p) => (
        <span className="text-text-muted">{formatDate(p.created_at)}</span>
      ),
      sortValue: (p) => p.created_at,
    },
    {
      key: "payment",
      header: "תשלום",
      cell: (p) => {
        const s = payStatusByPlayer[p.id];
        if (!s) return <span className="text-text-muted">—</span>;
        return (
          <Badge variant={s === "owes" ? "danger" : "success"}>
            {s === "owes" ? "חוב" : "שולם"}
          </Badge>
        );
      },
      sortValue: (p) => payStatusByPlayer[p.id] ?? "",
      filter: {
        label: "תשלום",
        value: (p) => {
          const s = payStatusByPlayer[p.id];
          return s === "owes" ? "חוב" : s === "paid" ? "שולם" : "";
        },
      },
    },
    {
      key: "status",
      header: "סטטוס",
      align: "end",
      cell: (p) => (
        <Badge variant={STATUS_VARIANT[p.status]}>
          {PLAYER_STATUS_LABELS[p.status]}
        </Badge>
      ),
      sortValue: (p) => PLAYER_STATUS_LABELS[p.status],
      filter: { label: "סטטוס", value: (p) => PLAYER_STATUS_LABELS[p.status] },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={players}
        rowKey={(p) => p.id}
        onRowClick={readOnly ? undefined : open}
        searchAccessor={(p) =>
          `${p.first_name} ${p.last_name} ${p.national_id ?? ""}`
        }
        searchPlaceholder="חיפוש לפי שם או ת.ז.…"
        emptyMessage="עדיין אין שחקנים."
      />

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
    </>
  );
}
