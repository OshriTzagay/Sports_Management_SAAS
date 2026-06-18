import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { requirePlatformUser } from "@/features/platform-auth";
import { CreateClubForm } from "@/features/clubs/create-club-form";

export default async function NewClubPage() {
  await requirePlatformUser();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">הקמת מועדון חדש</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateClubForm />
      </CardContent>
    </Card>
  );
}
