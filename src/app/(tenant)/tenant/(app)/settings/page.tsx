import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentPermissions } from "@/features/tenant-auth";
import { getClubBranding, logoPublicUrl } from "@/features/branding";
import { getBillingSettings } from "@/features/payments";
import { BrandingForm } from "@/features/branding/branding-form";
import { LogoUpload } from "@/features/branding/logo-upload";
import { BillingSettingsForm } from "@/features/payments/billing-settings-form";

export default async function SettingsPage() {
  const perms = await getCurrentPermissions();
  const canManageSettings = perms.has("settings.manage");
  const [branding, billing] = await Promise.all([
    getClubBranding(),
    getBillingSettings(),
  ]);
  const logoUrl = logoPublicUrl(branding?.logo_path ?? null);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-text-primary text-xl font-bold">הגדרות</h1>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {canManageSettings && (
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
        )}

        {canManageSettings && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">חיוב ותשלומים</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingSettingsForm settings={billing} />
            </CardContent>
          </Card>
        )}

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
