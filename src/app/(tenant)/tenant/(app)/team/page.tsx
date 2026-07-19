import { redirect } from "next/navigation";

import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { listStaff, listAssignableRoles } from "@/features/staff";
import { listCoaches } from "@/features/coaches";
import { StaffList } from "@/features/staff/staff-list";
import { InviteStaffForm } from "@/features/staff/invite-staff-form";

export default async function TeamPage() {
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  if (!perms.has("users.manage")) redirect("/");

  const [staff, roles, coaches] = await Promise.all([
    listStaff(),
    listAssignableRoles(),
    listCoaches(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">צוות</h1>
        <FormDialog triggerLabel="+ הזמנת משתמש" title="הזמנת משתמש">
          <InviteStaffForm roles={roles} coaches={coaches} />
        </FormDialog>
      </div>
      <StaffList
        staff={staff}
        roles={roles}
        coaches={coaches}
        currentUserId={user.id}
      />
    </div>
  );
}
