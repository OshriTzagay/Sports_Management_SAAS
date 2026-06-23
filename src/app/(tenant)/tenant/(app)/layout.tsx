import { type ReactNode } from "react";

import { TenantSidebar } from "@/components/tenant-sidebar";
import { requireUser } from "@/features/tenant-auth";
import { getActiveSeason } from "@/features/seasons";
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
  const [activeSeason, branding] = await Promise.all([
    getActiveSeason(),
    getClubBranding(),
  ]);

  return (
    <div
      className="flex min-h-full flex-1"
      style={brandStyleVars(branding?.primary_color ?? null)}
    >
      <TenantSidebar
        userEmail={user.email}
        activeSeasonName={activeSeason?.name ?? null}
        clubName={branding?.display_name ?? null}
        logoUrl={logoPublicUrl(branding?.logo_path ?? null)}
      />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
