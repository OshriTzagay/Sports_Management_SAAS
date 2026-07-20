"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  cancelChargeAction,
  recordManualPaymentAction,
  waiveChargeAction,
} from "./actions";
import {
  CHARGE_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  formatAgorot,
  type Charge,
  type PaymentMethod,
} from "./types";

const OPEN_STATUSES = ["pending", "partially_paid", "failed"] as const;
const METHODS: PaymentMethod[] = ["cash", "bank_transfer", "check", "other"];
const selectClass =
  "h-10 rounded-md border border-border bg-bg-surface px-3 text-sm text-text-primary";

export function ChargeActionsPanel({
  charge,
  canManage,
  onDone,
}: {
  charge: Charge;
  canManage: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const balance = Math.max(0, charge.amount_agorot - charge.paid_agorot);
  const isOpen = (OPEN_STATUSES as readonly string[]).includes(charge.status);

  function run(
    action: (fd: FormData) => Promise<void>,
    fields: Record<string, string>,
    after?: () => void,
  ) {
    const formData = new FormData();
    for (const [k, v] of Object.entries(fields)) formData.set(k, v);
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
        router.refresh();
        after?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה");
      }
    });
  }

  function recordPayment(formData: FormData) {
    formData.set("chargeId", charge.id);
    setError(null);
    startTransition(async () => {
      try {
        await recordManualPaymentAction(formData);
        router.refresh();
        onDone();
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה ברישום התשלום");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {!charge.contact_id && (
        <p className="bg-warning-bg text-warning-text rounded-md px-3 py-2 text-xs">
          ⚠️ לשחקן אין איש קשר לחיוב — לא ניתן לשלוח קישור תשלום. הוסף איש קשר
          וסמן אותו כ״משלם״ בכרטיס השחקן.
        </p>
      )}
      <dl className="border-border bg-bg-surface flex flex-col gap-1.5 rounded-lg border p-3 text-sm">
        <Row label="שחקן" value={charge.player_name} />
        <Row label="איש קשר לחיוב" value={charge.contact_name ?? "לא הוגדר"} />
        <Row label="תיאור" value={charge.description} />
        {charge.discount_agorot > 0 && (
          <Row
            label="הנחה / מלגה"
            value={`${formatAgorot(charge.discount_agorot, charge.currency)}${
              charge.discount_reason ? ` · ${charge.discount_reason}` : ""
            }`}
          />
        )}
        <Row
          label="סכום לתשלום"
          value={formatAgorot(charge.amount_agorot, charge.currency)}
        />
        <Row
          label="שולם"
          value={formatAgorot(charge.paid_agorot, charge.currency)}
        />
        <Row label="יתרה" value={formatAgorot(balance, charge.currency)} />
        {charge.vat_rate > 0 && (
          <Row label="מע״מ" value={`${charge.vat_rate}%`} />
        )}
        <Row label="סטטוס" value={CHARGE_STATUS_LABELS[charge.status]} />
      </dl>

      {canManage && isOpen && (
        <>
          <form action={recordPayment} className="flex flex-col gap-2">
            <span className="text-text-muted text-xs">רישום תשלום ידני</span>
            <div className="flex gap-2">
              <Input
                name="amount"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="סכום ₪"
                defaultValue={(balance / 100).toFixed(2)}
                required
                className="flex-1"
              />
              <select name="method" defaultValue="cash" className={selectClass}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                variant="secondary"
                disabled={pending}
                className="shrink-0"
              >
                {pending ? <Spinner className="size-4" /> : "רישום"}
              </Button>
            </div>
          </form>

          <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (confirm("לפטור את החיוב במלואו?")) {
                  run(waiveChargeAction, { chargeId: charge.id }, onDone);
                }
              }}
              className="text-text-muted hover:text-primary-700 text-xs underline"
            >
              פטור מלא
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (confirm("לבטל את החיוב?")) {
                  run(cancelChargeAction, { chargeId: charge.id }, onDone);
                }
              }}
              className="text-text-muted hover:text-danger text-xs underline"
            >
              ביטול חיוב
            </button>
          </div>
        </>
      )}

      {error && <p className="text-danger text-sm">{error}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text-primary text-end">{value}</dd>
    </div>
  );
}
