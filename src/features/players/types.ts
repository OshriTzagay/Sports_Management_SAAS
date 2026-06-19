export type PlayerStatus = "active" | "inactive" | "left";

export interface Player {
  id: string;
  club_id: string;
  first_name: string;
  last_name: string;
  national_id: string | null;
  birth_date: string | null;
  status: PlayerStatus;
  created_at: string;
}

export const PLAYER_STATUS_LABELS: Record<PlayerStatus, string> = {
  active: "פעיל",
  inactive: "לא פעיל",
  left: "עזב",
};
