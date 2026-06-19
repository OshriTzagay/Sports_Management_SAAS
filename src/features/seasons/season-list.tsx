import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SeasonRowActions } from "./season-row-actions";
import type { Season } from "./types";

export function SeasonList({ seasons }: { seasons: Season[] }) {
  if (seasons.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין עונות.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {seasons.map((season) => (
        <Card key={season.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <span className="text-text-primary font-medium">{season.name}</span>
            {season.is_active && <Badge variant="success">פעילה</Badge>}
            {season.status === "closed" && <Badge variant="muted">סגורה</Badge>}
          </div>
          <SeasonRowActions season={season} />
        </Card>
      ))}
    </ul>
  );
}
