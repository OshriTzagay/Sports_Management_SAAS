// Public API של feature המאמנים (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listCoaches, getCoach, listSeasonCoachAssignments } from "./queries";
export {
  COACH_STATUS_LABELS,
  COACH_ROLE_LABELS,
  type Coach,
  type CoachStatus,
  type CoachRole,
  type CoachAssignment,
} from "./types";
