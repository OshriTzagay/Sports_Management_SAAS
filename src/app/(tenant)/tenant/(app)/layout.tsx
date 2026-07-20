import { type ReactNode } from "react";
import { redirect } from "next/navigation";

import { TenantSidebar } from "@/components/tenant-sidebar";
import { BrandingLogoProvider } from "@/components/branding-logo-provider";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { getMyCoachId } from "@/features/trainings";
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
  if (user.must_change_password) redirect("/set-password");

  const [seasons, selectedSeason, branding, permissions, coachId] =
    await Promise.all([
      listSeasons(),
      getSelectedSeason(),
      getClubBranding(),
      getUserPermissions(user),
      getMyCoachId(),
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
        canManageStaff={permissions.has("users.manage")}
        isCoach={coachId !== null}
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
