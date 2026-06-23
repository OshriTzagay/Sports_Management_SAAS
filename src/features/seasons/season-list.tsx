"use client";

import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { RowModal } from "@/components/ui/row-modal";
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
  const [selected, setSelected] = useState<Season | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (season: Season) => {
    setSelected(season);
    dialogRef.current?.showModal();
  };
  const close = useCallback(() => dialogRef.current?.close(), []);

  if (seasons.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין עונות.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>עונה</TableHead>
            <TableHead>תאריכים</TableHead>
            <TableHead className="text-end">סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seasons.map((season) => (
            <TableRow
              key={season.id}
              onClick={() => open(season)}
              className="cursor-pointer"
            >
              <TableCell className="text-text-primary font-medium">
                {season.name}
              </TableCell>
              <TableCell className="text-text-muted">
                {formatRange(season.starts_on, season.ends_on)}
              </TableCell>
              <TableCell className="text-end">
                <StatusBadge season={season} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <RowModal dialogRef={dialogRef} title="עריכת עונה" onClose={close}>
        {selected && (
          <div className="flex flex-col gap-4">
            <EditSeasonForm
              key={selected.id}
              season={selected}
              onClose={close}
            />
            <div className="border-border flex items-center gap-2 border-t pt-4">
              <SeasonRowActions season={selected} />
            </div>
          </div>
        )}
      </RowModal>
    </>
  );
}
