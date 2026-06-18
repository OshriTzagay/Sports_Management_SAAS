import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requirePlatformUser, signOutPlatform } from "@/features/platform-auth";
import { listClubs } from "@/features/clubs";
import { ClubList } from "@/features/clubs/club-list";

export default async function ControlPlaneHome() {
  const platformUser = await requirePlatformUser();
  const clubs = await listClubs();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-text-muted text-sm">{platformUser.email}</span>
        <form action={signOutPlatform}>
          <Button variant="ghost" size="sm" type="submit">
            התנתקות
          </Button>
        </form>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-xl font-bold">מועדונים</h1>
        <Button asChild size="sm">
          <Link href="/clubs/new">+ מועדון חדש</Link>
        </Button>
      </div>

      <ClubList clubs={clubs} />
    </div>
  );
}
