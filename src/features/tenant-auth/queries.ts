import "server-only";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CurrentUser } from "./types";

/**
 * מחזיר את משתמש המועדון המחובר, או null.
 * הגנת עומק: claim club_id ב-JWT (ולא is_platform) + רשומה בטבלת users.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const clubId = user?.app_metadata?.club_id;
  if (
    !user ||
    typeof clubId !== "string" ||
    user.app_metadata?.is_platform === true
  ) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("id, club_id, email, full_name, role_id, status")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  // משתמש מושבת נחסם מכניסה — השבתה חייבת להיות אפקטיבית.
  const row = data as (CurrentUser & { status: string }) | null;
  if (!row || row.status !== "active") return null;

  return {
    id: row.id,
    club_id: row.club_id,
    email: row.email,
    full_name: row.full_name,
    role_id: row.role_id,
  };
}

/**
 * שער כניסה לאזור המועדון (default-deny).
 * מבחין בין "לא מחובר" (→ /login) ל"מחובר אך הושבת/הוסר" (→ /login?reason=disabled),
 * כדי שהמשתמש יקבל הודעה במקום להיזרק בשקט.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (user) return user;

  // אין משתמש תקף — האם יש session פעיל (הושבת/הוסר) או פשוט לא מחובר?
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    try {
      await supabase.auth.signOut();
    } catch {
      // כישלון ניתוק לא צריך לחסום את ההפניה עם ההודעה.
    }
    redirect("/login?reason=disabled");
  }
  redirect("/login");
}
