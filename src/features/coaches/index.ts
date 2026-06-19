// Public API של feature המאמנים (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listCoaches } from "./queries";
export { COACH_STATUS_LABELS, type Coach, type CoachStatus } from "./types";
