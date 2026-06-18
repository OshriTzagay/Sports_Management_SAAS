import "server-only";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PlatformUser } from "./types";

/**
 * מחזיר את משתמש הפלטפורמה המחובר, או null.
 * הגנת עומק: גם claim ב-JWT (is_platform) וגם רשומה בטבלת platform_users.
 */
export async function getPlatformUser(): Promise<PlatformUser | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_platform !== true) return null;

  const { data } = await supabase
    .from("platform_users")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .is("deleted_at", null)
    .maybeSingle();

  return (data as PlatformUser | null) ?? null;
}

/** שער כניסה ל-Control Plane (default-deny): מפנה ל-login אם לא מחובר. */
export async function requirePlatformUser(): Promise<PlatformUser> {
  const platformUser = await getPlatformUser();
  if (!platformUser) redirect("/login");
  return platformUser;
}
