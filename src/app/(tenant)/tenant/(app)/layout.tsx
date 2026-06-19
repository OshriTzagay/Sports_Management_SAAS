import { type ReactNode } from "react";

import { TenantSidebar } from "@/components/tenant-sidebar";
import { requireUser } from "@/features/tenant-auth";
import { getActiveSeason } from "@/features/seasons";

/** מעטפת ה-CMS של המועדון: שער כניסה (default-deny) + סייד-בר ניווט. */
export default async function TenantAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const activeSeason = await getActiveSeason();

  return (
    <div className="flex min-h-full flex-1">
      <TenantSidebar
        userEmail={user.email}
        activeSeasonName={activeSeason?.name ?? null}
      />
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
