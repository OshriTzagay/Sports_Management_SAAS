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

/** שער כניסה לאזור המועדון (default-deny): מפנה ל-login אם לא מחובר. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
