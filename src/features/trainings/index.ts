// Public API של feature האימונים (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export {
  getMyCoachId,
  listCoachTeams,
  listTrainingsForCoach,
  listTrainingsByCoach,
  getTraining,
  listAttendance,
} from "./queries";
export {
  TRAINING_STATUS_LABELS,
  type TrainingSession,
  type TrainingStatus,
  type AttendanceRow,
  type AttendanceStatus,
  type CoachTeam,
} from "./types";
