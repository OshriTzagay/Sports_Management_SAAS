import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireUser, signOutTenant } from "@/features/tenant-auth";

export default async function TenantHome() {
  const user = await requireUser();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-sm">{user.email}</span>
        <form action={signOutTenant}>
          <Button variant="ghost" size="sm" type="submit">
            התנתקות
          </Button>
        </form>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">לוח הבקרה</CardTitle>
          <CardDescription>
            כאן ינוהלו שחקנים, קבוצות, עונות ותשלומים. (Phase 1 בבנייה)
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
