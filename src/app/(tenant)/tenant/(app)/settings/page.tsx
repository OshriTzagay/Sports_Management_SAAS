import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/tenant-auth";
import { getClubBranding } from "@/features/branding";
import { BrandingForm } from "@/features/branding/branding-form";

export default async function SettingsPage() {
  await requireUser();
  const branding = await getClubBranding();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-text-primary text-xl font-bold">הגדרות</h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base">מיתוג המועדון</CardTitle>
        </CardHeader>
        <CardContent>
          <BrandingForm branding={branding} />
        </CardContent>
      </Card>
    </div>
  );
}
