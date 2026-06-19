import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/tenant-auth";
import { listPlayers } from "@/features/players";
import { PlayerList } from "@/features/players/player-list";
import { CreatePlayerForm } from "@/features/players/create-player-form";

export default async function PlayersPage() {
  await requireUser();
  const players = await listPlayers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-text-primary text-xl font-bold">שחקנים</h1>
      <PlayerList players={players} />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">הוספת שחקן</CardTitle>
        </CardHeader>
        <CardContent>
          <CreatePlayerForm />
        </CardContent>
      </Card>
    </div>
  );
}
