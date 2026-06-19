export interface Season {
  id: string;
  club_id: string;
  name: string;
  starts_on: string | null;
  ends_on: string | null;
  is_active: boolean;
  status: "active" | "closed";
  created_at: string;
}
