import { notFound } from "next/navigation";

import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { listPlayers } from "@/features/players";
import { listPlayerContacts } from "@/features/contacts";
import { listCharges } from "@/features/payments";
import { ChargeList } from "@/features/payments/charge-list";
import { CreateChargeForm } from "@/features/payments/create-charge-form";

export default async function PaymentsPage() {
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  if (!perms.has("payments.view")) notFound();

  const canManage = perms.has("payments.charge");
  const [charges, players, contactLinks] = await Promise.all([
    listCharges(),
    listPlayers(),
    listPlayerContacts(),
  ]);

  // שחקנים שיש להם איש קשר לחיוב (לצורך אזהרה ביצירת חיוב).
  const playersWithBilling = [
    ...new Set(
      contactLinks
        .filter((link) => link.is_billing_contact)
        .map((link) => link.player_id),
    ),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-text-primary text-xl font-bold">תשלומים</h1>
        {canManage && (
          <FormDialog triggerLabel="+ חיוב" title="חיוב חדש">
            <CreateChargeForm
              players={players}
              playersWithBilling={playersWithBilling}
            />
          </FormDialog>
        )}
      </div>
      <ChargeList charges={charges} canManage={canManage} />
    </div>
  );
}
