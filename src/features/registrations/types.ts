/** הקשר הרשמה ציבורי — נפתר לפי slug (מיתוג + דמי רישום + עונה + פתוח?). */
export interface RegistrationContext {
  clubId: string;
  clubName: string;
  logoPath: string | null;
  primaryColor: string | null;
  feeAgorot: number;
  vatRate: number;
  currency: string;
  seasonId: string | null;
  seasonName: string | null;
  open: boolean;
}

export type RegistrationStatus =
  | "pending"
  | "paid"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "ממתין לתשלום",
  paid: "שולם",
  completed: "הושלם",
  failed: "נכשל",
  cancelled: "בוטל",
  expired: "פג",
};

/** שורת הרשמה לצוות (שקיפות לאדמין). */
export interface RegistrationRow {
  id: string;
  status: RegistrationStatus;
  player_first_name: string;
  player_last_name: string;
  contact_first_name: string;
  contact_phone: string;
  amount_agorot: number;
  currency: string;
  created_at: string;
  completed_at: string | null;
  player_id: string | null;
}
