import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requirePlatformUser, signOutPlatform } from "@/features/platform-auth";

export default async function ControlPlaneHome() {
  const platformUser = await requirePlatformUser();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-sm">{platformUser.email}</span>
        <form action={signOutPlatform}>
          <Button variant="ghost" size="sm" type="submit">
            התנתקות
          </Button>
        </form>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">פאנל הפלטפורמה</CardTitle>
          <CardDescription>
            כאן ינוהלו המועדונים, המנויים והדשבורד הרוחבי. (האזור שלך — admin)
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
