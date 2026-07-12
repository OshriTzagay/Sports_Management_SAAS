// Public API של feature אנשי הקשר (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listContacts, listPlayerContacts } from "./queries";
export type { PlayerContactRow } from "./queries";
export {
  RELATIONSHIP_LABELS,
  type Contact,
  type Relationship,
  type PlayerContactLink,
} from "./types";
