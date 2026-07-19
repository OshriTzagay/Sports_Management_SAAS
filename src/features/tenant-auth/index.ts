// Public API של feature ה-auth למועדון (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { getCurrentUser, requireUser } from "./queries";
export {
  getUserPermissions,
  getCurrentPermissions,
  requirePermission,
  PERMISSION_KEYS,
  type PermissionKey,
} from "./permissions";
export { signOutTenant } from "./actions";
export type { CurrentUser } from "./types";
