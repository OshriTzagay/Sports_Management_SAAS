/** הגדרות חיוב פר-מועדון (מע"מ + מטבע). */
export interface BillingSettings {
  /** שיעור מע"מ באחוזים (למשל 18). 0 = פטור (עמותה). */
  vat_rate: number;
  currency: string;
  /** דמי רישום (agorot) לטופס ההרשמה הציבורי. */
  registration_fee_agorot: number;
  /** האם ההרשמה הציבורית פתוחה. */
  registration_open: boolean;
}

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  vat_rate: 0,
  currency: "ILS",
  registration_fee_agorot: 0,
  registration_open: false,
};

export const CURRENCY_LABELS: Record<string, string> = {
  ILS: "₪ שקל",
  USD: "$ דולר",
  EUR: "€ אירו",
};

export type ChargeStatus =
  | "pending"
  | "partially_paid"
  | "paid"
  | "waived"
  | "failed"
  | "refunded"
  | "cancelled";

export const CHARGE_STATUS_LABELS: Record<ChargeStatus, string> = {
  pending: "ממתין לתשלום",
  partially_paid: "שולם חלקית",
  paid: "שולם",
  waived: "פטור",
  failed: "נכשל",
  refunded: "זוכה",
  cancelled: "בוטל",
};

export type PaymentMethod =
  | "card"
  | "cash"
  | "bank_transfer"
  | "check"
  | "other";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  card: "כרטיס אשראי",
  cash: "מזומן",
  bank_transfer: "העברה בנקאית",
  check: "צ׳ק",
  other: "אחר",
};

/** חיוב — כולל שמות (שחקן/איש קשר) וסכום ששולם (agorot), ל-UI. */
export interface Charge {
  id: string;
  player_id: string;
  player_name: string;
  contact_id: string | null;
  contact_name: string | null;
  description: string;
  amount_agorot: number;
  original_amount_agorot: number | null;
  discount_agorot: number;
  discount_reason: string | null;
  vat_rate: number;
  currency: string;
  status: ChargeStatus;
  due_date: string | null;
  paid_agorot: number;
  created_at: string;
}

/** ₪ מאגורות (2 ספרות). */
export function formatAgorot(agorot: number, currency = "ILS"): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₪";
  return `${symbol}${(agorot / 100).toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
