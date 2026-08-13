import type { Charge } from "./types";

/** תמצית פיננסית של החיובים — לכרטיסי ה-KPI במסך התשלומים. */
export interface PaymentStats {
  /** סה"כ חויב (agorot) — חיובים פעילים, ללא מבוטלים/פטורים. */
  totalBilledAgorot: number;
  /** נגבה בפועל (agorot). */
  collectedAgorot: number;
  /** יתרה לגבייה (agorot) — חיובים פתוחים בלבד. */
  outstandingAgorot: number;
  /** מספר חיובים פתוחים (ממתין / שולם חלקית). */
  openCount: number;
  /** מתוכם שעברו את תאריך היעד. */
  overdueCount: number;
}

const OPEN_STATUSES = new Set(["pending", "partially_paid"]);
const VOID_STATUSES = new Set(["cancelled", "waived"]);

/** מחשב תמצית פיננסית מרשימת חיובים. פונקציה טהורה (בטוחה גם ב-client). */
export function computePaymentStats(charges: Charge[]): PaymentStats {
  const today = new Date().toISOString().slice(0, 10);
  let totalBilledAgorot = 0;
  let collectedAgorot = 0;
  let outstandingAgorot = 0;
  let openCount = 0;
  let overdueCount = 0;

  for (const charge of charges) {
    collectedAgorot += charge.paid_agorot;
    if (VOID_STATUSES.has(charge.status)) continue;
    totalBilledAgorot += charge.amount_agorot;

    if (OPEN_STATUSES.has(charge.status)) {
      openCount += 1;
      outstandingAgorot += Math.max(
        charge.amount_agorot - charge.paid_agorot,
        0,
      );
      if (charge.due_date && charge.due_date < today) overdueCount += 1;
    }
  }

  return {
    totalBilledAgorot,
    collectedAgorot,
    outstandingAgorot,
    openCount,
    overdueCount,
  };
}
