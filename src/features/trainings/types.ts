export type TrainingStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  scheduled: "מתוזמן",
  in_progress: "מתקיים",
  completed: "הושלם",
  cancelled: "בוטל",
};

export type AttendanceStatus = "present" | "absent";

/** אימון — כולל שם קבוצה וספירת נוכחות (X מתוך Y) ל-UI. */
export interface TrainingSession {
  id: string;
  season_id: string;
  team_id: string;
  team_name: string | null;
  coach_id: string;
  title: string | null;
  scheduled_at: string;
  status: TrainingStatus;
  started_at: string | null;
  ended_at: string | null;
  notes: string | null;
  present_count: number;
  roster_count: number;
}

/** שורת נוכחות לשחקן באימון. */
export interface AttendanceRow {
  player_id: string;
  first_name: string;
  last_name: string;
  status: AttendanceStatus;
}

/** קבוצה שהמאמן משויך אליה (לבחירה ביצירת אימון). */
export interface CoachTeam {
  team_id: string;
  team_name: string;
}
