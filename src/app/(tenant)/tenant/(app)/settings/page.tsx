import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/features/tenant-auth";
import { getClubBranding, logoPublicUrl } from "@/features/branding";
import { BrandingForm } from "@/features/branding/branding-form";
import { LogoUpload } from "@/features/branding/logo-upload";

export default async function SettingsPage() {
  await requireUser();
  const branding = await getClubBranding();
  const logoUrl = logoPublicUrl(branding?.logo_path ?? null);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-text-primary text-xl font-bold">הגדרות</h1>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">מיתוג המועדון</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <LogoUpload logoUrl={logoUrl} />
            <div className="border-border border-t" />
            <BrandingForm branding={branding} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ערכת נושא</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <ThemeToggle />
            <p className="text-text-muted text-xs">
              בהיר / כהה / לפי הגדרת המערכת. ההעדפה נשמרת בדפדפן.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
