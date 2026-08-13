import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { computePaymentStats } from "./stats";
import {
  CHARGE_STATUS_LABELS,
  formatAgorot,
  type Charge,
  type ChargeStatus,
} from "./types";

const STATUS_VARIANT: Record<
  ChargeStatus,
  "success" | "muted" | "danger" | "info"
> = {
  pending: "muted",
  partially_paid: "info",
  paid: "success",
  waived: "info",
  failed: "danger",
  refunded: "muted",
  cancelled: "muted",
};

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString("he-IL") : "—";
}

function SummaryCard({
  label,
  value,
  accent = "neutral",
}: {
  label: string;
  value: string;
  accent?: "neutral" | "success" | "danger";
}) {
  const valueColor =
    accent === "danger"
      ? "text-danger"
      : accent === "success"
        ? "text-success-text"
        : "text-text-primary";
  return (
    <Card className="p-4">
      <p className="text-text-muted text-[13px]">{label}</p>
      <p className={cn("mt-1 text-xl font-bold", valueColor)}>{value}</p>
    </Card>
  );
}

/** כרטסת פיננסית של שחקן — סיכום (חויב/שולם/יתרה) + טבלת חיובים. */
export function PlayerStatement({ charges }: { charges: Charge[] }) {
  const stats = computePaymentStats(charges);
  const currency = charges[0]?.currency ?? "ILS";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="חויב"
          value={formatAgorot(stats.totalBilledAgorot, currency)}
        />
        <SummaryCard
          label="שולם"
          value={formatAgorot(stats.collectedAgorot, currency)}
          accent="success"
        />
        <SummaryCard
          label="יתרה לתשלום"
          value={formatAgorot(stats.outstandingAgorot, currency)}
          accent={stats.outstandingAgorot > 0 ? "danger" : "success"}
        />
      </div>

      {charges.length === 0 ? (
        <p className="text-text-muted text-sm">אין חיובים לשחקן זה.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>תאריך</TableHead>
              <TableHead>תיאור</TableHead>
              <TableHead>סכום</TableHead>
              <TableHead>שולם</TableHead>
              <TableHead className="text-end">סטטוס</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map((charge) => (
              <TableRow key={charge.id}>
                <TableCell className="text-text-muted whitespace-nowrap">
                  {formatDate(charge.due_date ?? charge.created_at)}
                </TableCell>
                <TableCell className="text-text-primary">
                  {charge.description}
                </TableCell>
                <TableCell>
                  {formatAgorot(charge.amount_agorot, charge.currency)}
                </TableCell>
                <TableCell className="text-text-muted">
                  {formatAgorot(charge.paid_agorot, charge.currency)}
                </TableCell>
                <TableCell className="text-end">
                  <Badge variant={STATUS_VARIANT[charge.status]}>
                    {CHARGE_STATUS_LABELS[charge.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
