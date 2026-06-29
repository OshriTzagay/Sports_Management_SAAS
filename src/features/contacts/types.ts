export interface Contact {
  id: string;
  club_id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export type Relationship = "father" | "mother" | "guardian" | "self" | "other";

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  father: "אבא",
  mother: "אמא",
  guardian: "אפוטרופוס",
  self: "עצמי",
  other: "אחר",
};

/** קישור איש-קשר לשחקן (כולל פרטי איש הקשר, ל-UI). */
export interface PlayerContactLink {
  id: string;
  contact_id: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  relationship: Relationship;
  is_billing_contact: boolean;
}
