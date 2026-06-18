import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Club } from "./types";

const STATUS: Record<
  Club["status"],
  { label: string; variant: "success" | "info" | "danger" }
> = {
  active: { label: "פעיל", variant: "success" },
  trial: { label: "ניסיון", variant: "info" },
  suspended: { label: "מושעה", variant: "danger" },
};

export function ClubList({ clubs }: { clubs: Club[] }) {
  if (clubs.length === 0) {
    return <p className="text-text-muted text-sm">עדיין אין מועדונים.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {clubs.map((club) => (
        <Card key={club.id} className="flex items-center justify-between p-4">
          <div>
            <p className="text-text-primary font-medium">{club.name}</p>
            <p className="text-text-muted text-xs">{club.slug}</p>
          </div>
          <Badge variant={STATUS[club.status].variant}>
            {STATUS[club.status].label}
          </Badge>
        </Card>
      ))}
    </ul>
  );
}
