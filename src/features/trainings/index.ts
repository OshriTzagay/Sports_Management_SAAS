// Public API של feature האימונים (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export {
  getMyCoachId,
  listCoachTeams,
  listTrainingsForCoach,
  listSeasonTrainings,
  listTrainingsByCoach,
  getTraining,
  listAttendance,
  listCoachAttendanceSummary,
} from "./queries";
export {
  TRAINING_STATUS_LABELS,
  ABSENCE_ALERT_THRESHOLD,
  type TrainingSession,
  type TrainingStatus,
  type AttendanceRow,
  type AttendanceStatus,
  type CoachTeam,
  type PlayerAttendance,
} from "./types";
