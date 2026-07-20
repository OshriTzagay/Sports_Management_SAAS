/** הגדרות חיוב פר-מועדון (מע"מ + מטבע). */
export interface BillingSettings {
  /** שיעור מע"מ באחוזים (למשל 18). 0 = פטור (עמותה). */
  vat_rate: number;
  currency: string;
}

export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  vat_rate: 0,
  currency: "ILS",
};

export const CURRENCY_LABELS: Record<string, string> = {
  ILS: "₪ שקל",
  USD: "$ דולר",
  EUR: "€ אירו",
};
