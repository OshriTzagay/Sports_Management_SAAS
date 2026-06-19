import { Card } from "@/components/ui/card";
import { TeamDeleteButton } from "./team-delete-button";
import type { Team } from "./types";

export function TeamList({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return <p className="text-text-muted text-sm">אין קבוצות בעונה זו.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {teams.map((team) => (
        <Card key={team.id} className="flex items-center justify-between p-4">
          <div>
            <p className="text-text-primary font-medium">{team.name}</p>
            {team.age_category && (
              <p className="text-text-muted text-xs">{team.age_category}</p>
            )}
          </div>
          <TeamDeleteButton teamId={team.id} />
        </Card>
      ))}
    </ul>
  );
}
