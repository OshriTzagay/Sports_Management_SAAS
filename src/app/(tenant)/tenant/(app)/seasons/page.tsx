import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/tenant-auth";
import { listSeasons } from "@/features/seasons";
import { SeasonList } from "@/features/seasons/season-list";
import { SeasonStatusInfo } from "@/features/seasons/season-status-info";
import { CreateSeasonForm } from "@/features/seasons/create-season-form";

export default async function SeasonsPage() {
  await requireUser();
  const seasons = await listSeasons();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-bold">עונות</h1>
        <SeasonStatusInfo />
      </div>
      <SeasonList seasons={seasons} />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">הוספת עונה</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateSeasonForm seasons={seasons} />
        </CardContent>
      </Card>
    </div>
  );
}
