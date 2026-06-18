// Public API של feature ה-auth לפלטפורמה (לצרכני צד-שרת).
// רכיבי client מייבאים את ה-actions ישירות מ-./actions (גבול ה-RPC).
export { getPlatformUser, requirePlatformUser } from "./queries";
export { signOutPlatform } from "./actions";
export type { PlatformUser } from "./types";
