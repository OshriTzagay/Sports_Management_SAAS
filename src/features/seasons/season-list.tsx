import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SeasonRowActions } from "./season-row-actions";
import type { Season } from "./types";

function formatRange(
  startsOn: string | null,
  endsOn: string | null,
): string | null {
  if (!startsOn && !endsOn) return null;
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
    <ul className="flex flex-col gap-2">
      {seasons.map((season) => {
        const range = formatRange(season.starts_on, season.ends_on);
        return (
          <Card
            key={season.id}
            className={cn(
              "flex items-center justify-between p-4",
              season.is_active && "border-primary-300 bg-primary-50/40",
              season.status === "closed" && "opacity-70",
            )}
          >
            <div className="flex items-center gap-3">
              <StatusBadge season={season} />
              <div>
                <p className="text-text-primary font-medium">{season.name}</p>
                {range && <p className="text-text-muted text-xs">{range}</p>}
              </div>
            </div>
            <SeasonRowActions season={season} />
          </Card>
        );
      })}
    </ul>
  );
}
