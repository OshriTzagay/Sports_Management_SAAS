import { notFound } from "next/navigation";

import { FormDialog } from "@/components/ui/form-dialog";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { requireUser, getUserPermissions } from "@/features/tenant-auth";
import { listPlayers } from "@/features/players";
import { listPlayerContacts } from "@/features/contacts";
import {
  getBillingSettings,
  listCharges,
  listProducts,
} from "@/features/payments";
import { listRegistrations } from "@/features/registrations";
import { ChargeList } from "@/features/payments/charge-list";
import { CreateChargeForm } from "@/features/payments/create-charge-form";
import { ProductList } from "@/features/payments/product-list";
import { CreateProductForm } from "@/features/payments/product-form";
import { PaymentStatsRow } from "@/features/payments/payment-stats";
import { computePaymentStats } from "@/features/payments/stats";
import { RegistrationsTable } from "@/features/registrations/registrations-table";

export default async function PaymentsPage() {
  const user = await requireUser();
  const perms = await getUserPermissions(user);
  if (!perms.has("payments.view")) notFound();

  const canManage = perms.has("payments.charge");
  const [charges, players, contactLinks, registrations, products, billing] =
    await Promise.all([
      listCharges(),
      listPlayers(),
      listPlayerContacts(),
      listRegistrations(),
      listProducts(),
      getBillingSettings(),
    ]);

  // שחקנים שיש להם איש קשר לחיוב (לצורך אזהרה ביצירת חיוב).
  const playersWithBilling = [
    ...new Set(
      contactLinks
        .filter((link) => link.is_billing_contact)
        .map((link) => link.player_id),
    ),
  ];

  const stats = computePaymentStats(charges);

  const tabs: TabItem[] = [
    {
      key: "charges",
      label: "חיובים",
      count: charges.length,
      toolbar: canManage && (
        <FormDialog triggerLabel="+ חיוב" title="חיוב חדש">
          <CreateChargeForm
            players={players}
            playersWithBilling={playersWithBilling}
            products={products.filter((p) => p.is_active)}
          />
        </FormDialog>
      ),
      content: <ChargeList charges={charges} canManage={canManage} />,
    },
    {
      key: "registrations",
      label: "הרשמות",
      count: registrations.length,
      content: <RegistrationsTable rows={registrations} />,
    },
  ];

  if (canManage) {
    tabs.push({
      key: "products",
      label: "מוצרים",
      count: products.length,
      toolbar: (
        <FormDialog triggerLabel="+ מוצר" title="מוצר חדש">
          <CreateProductForm />
        </FormDialog>
      ),
      content: <ProductList products={products} />,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-text-primary text-xl font-bold">תשלומים</h1>
      <PaymentStatsRow stats={stats} currency={billing.currency} />
      <Tabs items={tabs} />
    </div>
  );
}
