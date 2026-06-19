export type CoachStatus = "active" | "inactive";

export interface Coach {
  id: string;
  club_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  certification: string | null;
  license_expiry: string | null;
  status: CoachStatus;
  created_at: string;
}

export const COACH_STATUS_LABELS: Record<CoachStatus, string> = {
  active: "פעיל",
  inactive: "לא פעיל",
};
