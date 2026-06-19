// Public API של feature הקבוצות (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listTeams } from "./queries";
export type { Team } from "./types";
