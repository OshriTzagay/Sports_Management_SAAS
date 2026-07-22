import { notFound } from "next/navigation";

import { FormDialog } from "@/components/ui/form-dialog";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { listPlayers } from "@/features/players";
import { listPlayerContacts } from "@/features/contacts";
import { listCharges } from "@/features/payments";
import { listRegistrations } from "@/features/registrations";
import { ChargeList } from "@/features/payments/charge-list";
import { CreateChargeForm } from "@/features/payments/create-charge-form";
import { RegistrationsTable } from "@/features/registrations/registrations-table";

export default async function PaymentsPage() {
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  if (!perms.has("payments.view")) notFound();

  const canManage = perms.has("payments.charge");
  const [charges, players, contactLinks, registrations] = await Promise.all([
    listCharges(),
    listPlayers(),
    listPlayerContacts(),
    listRegistrations(),
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

      {registrations.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-text-primary text-sm font-bold">
            הרשמות עצמיות ({registrations.length})
          </h2>
          <RegistrationsTable rows={registrations} />
        </section>
      )}
    </div>
  );
}
