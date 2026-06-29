// Public API של feature אנשי הקשר (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listContacts } from "./queries";
export {
  RELATIONSHIP_LABELS,
  type Contact,
  type Relationship,
  type PlayerContactLink,
} from "./types";
