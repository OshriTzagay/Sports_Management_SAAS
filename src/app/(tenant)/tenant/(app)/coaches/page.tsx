import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/tenant-auth";
import { listCoaches } from "@/features/coaches";
import { CoachList } from "@/features/coaches/coach-list";
import { CreateCoachForm } from "@/features/coaches/create-coach-form";

export default async function CoachesPage() {
  await requireUser();
  const coaches = await listCoaches();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-text-primary text-xl font-bold">מאמנים</h1>
      <CoachList coaches={coaches} />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">הוספת מאמן</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCoachForm />
        </CardContent>
      </Card>
    </div>
  );
}
