// Public API של feature השחקנים (לצרכני צד-שרת).
// רכיבי client מייבאים actions ישירות מ-./actions (גבול ה-RPC).
export { listPlayers } from "./queries";
export { PLAYER_STATUS_LABELS, type Player, type PlayerStatus } from "./types";
