import { type ReactNode } from "react";

import { TenantSidebar } from "@/components/tenant-sidebar";
import { BrandingLogoProvider } from "@/components/branding-logo-provider";
import { requireUser } from "@/features/tenant-auth";
import { listSeasons, getSelectedSeason } from "@/features/seasons";
import {
  getClubBranding,
  brandStyleVars,
  logoPublicUrl,
} from "@/features/branding";

/** מעטפת ה-CMS של המועדון: שער כניסה (default-deny) + סייד-בר + branding בזמן ריצה. */
export default async function TenantAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const [seasons, selectedSeason, branding] = await Promise.all([
    listSeasons(),
    getSelectedSeason(),
    getClubBranding(),
  ]);
  const logoUrl = logoPublicUrl(branding?.logo_path ?? null);

  return (
    <div
      className="flex min-h-full flex-1"
      style={brandStyleVars(branding?.primary_color ?? null)}
    >
      <TenantSidebar
        userEmail={user.email}
        seasons={seasons}
        selectedSeasonId={selectedSeason?.id ?? null}
        clubName={branding?.display_name ?? null}
        logoUrl={logoUrl}
      />
      <main className="min-w-0 flex-1 p-5 lg:p-7">
        <div className="mx-auto w-full max-w-[1600px]">
          <BrandingLogoProvider logoUrl={logoUrl}>
            {children}
          </BrandingLogoProvider>
        </div>
      </main>
    </div>
  );
}
