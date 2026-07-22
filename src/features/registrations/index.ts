// Public API של feature ההרשמות (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { getRegistrationContext, listRegistrations } from "./queries";
export {
  REGISTRATION_STATUS_LABELS,
  type RegistrationContext,
  type RegistrationRow,
  type RegistrationStatus,
} from "./types";
