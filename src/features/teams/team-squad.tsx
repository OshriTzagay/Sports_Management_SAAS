import { Badge } from "@/components/ui/badge";
import {
  PLAYER_STATUS_LABELS,
  calculateAge,
  isMinor,
  type Player,
} from "@/features/players";
import type { PlayerStatus } from "@/features/players";

const STATUS_VARIANT: Record<PlayerStatus, "success" | "muted" | "danger"> = {
  active: "success",
  inactive: "muted",
  left: "danger",
};

function initials(p: Player): string {
  return `${p.first_name[0] ?? ""}${p.last_name[0] ?? ""}`.trim() || "?";
}

/** סגל הקבוצה ככרטיסיות. מקום ל-avatar/תמונה + נתוני השחקן הקיימים. */
export function TeamSquad({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return (
      <p className="text-text-muted text-sm">
        אין שחקנים משובצים לקבוצה זו בעונה הנוכחית.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((p) => {
        const age = calculateAge(p.birth_date);
        return (
          <div
            key={p.id}
            className="border-border bg-bg-surface flex flex-col gap-3 rounded-lg border p-4"
          >
            <div className="flex items-center gap-3">
              <span className="bg-primary-50 text-primary-700 flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold">
                {initials(p)}
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-text-primary truncate font-medium">
                  {p.first_name} {p.last_name}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant={STATUS_VARIANT[p.status]}>
                    {PLAYER_STATUS_LABELS[p.status]}
                  </Badge>
                  {isMinor(p.birth_date) && (
                    <span className="text-text-muted text-[0.7rem]">קטין</span>
                  )}
                </div>
              </div>
            </div>
            <dl className="text-text-muted flex flex-col gap-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt>ת.ז.</dt>
                <dd className="text-text-body">{p.national_id ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>גיל</dt>
                <dd className="text-text-body">
                  {age !== null ? `${age}` : "—"}
                  {p.birth_date
                    ? ` · ${new Date(p.birth_date).toLocaleDateString("he-IL")}`
                    : ""}
                </dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}
