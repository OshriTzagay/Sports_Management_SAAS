// Public API של feature המועדונים (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listClubs } from "./queries";
export type { Club, ProvisionClubInput, ProvisionClubResult } from "./types";
