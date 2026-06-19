// Public API של feature העונות (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listSeasons, getActiveSeason } from "./queries";
export type { Season } from "./types";
