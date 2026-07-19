import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "./queries";
import type { CurrentUser } from "./types";

/** קטלוג מפתחות ההרשאה — Single source of truth (תואם seed_permissions.sql). */
export const PERMISSION_KEYS = [
  "seasons.view",
  "seasons.manage",
  "teams.view",
  "teams.manage",
  "players.view",
  "players.manage",
  "coaches.view",
  "coaches.manage",
  "contacts.view",
  "contacts.manage",
  "payments.view",
  "payments.charge",
  "reports.view",
  "trainings.view",
  "trainings.manage",
  "users.view",
  "users.manage",
  "settings.manage",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

// צורת הנתונים הגולמית מ-Supabase (relation מקונן — אובייקט או מערך לפי ההסקה).
type RawRolePermission = {
  permissions: { key: string } | { key: string }[] | null;
};

/** קבוצת ההרשאות של המשתמש לפי ה-role שלו. ריק אם אין role (default-deny). */
export async function getUserPermissions(
  user: CurrentUser,
): Promise<Set<PermissionKey>> {
  if (!user.role_id) return new Set();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permissions(key)")
    .eq("role_id", user.role_id);
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawRolePermission[];
  const keys = rows.flatMap((row) => {
    const nested = row.permissions;
    const list = Array.isArray(nested) ? nested : nested ? [nested] : [];
    return list.map((p) => p.key as PermissionKey);
  });
  return new Set(keys);
}

/** ההרשאות של המשתמש המחובר כעת (לסינון UI בעמודים). */
export async function getCurrentPermissions(): Promise<Set<PermissionKey>> {
  const user = await requireUser();
  return getUserPermissions(user);
}

/**
 * שער הרשאה ל-actions רגישים (default-deny). מאמת התחברות + הרשאה ספציפית,
 * וזורק שגיאה קולנית אם חסרה. מחזיר את המשתמש לשימוש בהמשך ה-action.
 */
export async function requirePermission(
  key: PermissionKey,
): Promise<CurrentUser> {
  const user = await requireUser();
  const permissions = await getUserPermissions(user);
  if (!permissions.has(key)) {
    throw new Error(`forbidden: missing permission '${key}'`);
  }
  return user;
}
