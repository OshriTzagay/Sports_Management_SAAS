// Public API של feature ה-branding (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { getClubBranding } from "./queries";
export { brandStyleVars } from "./brand-style";
export { logoPublicUrl } from "./logo";
export type { ClubBranding } from "./types";
