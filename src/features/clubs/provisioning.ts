import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import { adminCreateAuthUser, adminDeleteAuthUser } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ProvisionClubInput, ProvisionClubResult } from "./types";

function generateTempPassword(): string {
  return randomBytes(9).toString("base64url"); // ~12 תווים
}

/**
 * מקים מועדון חדש: יוצר את משתמש האימות של מנהל המועדון (עם club_id ב-claim),
 * ואז מריץ את ה-RPC הטרנזקציוני provision_club ליצירת club/role/users/season/audit.
 * כשל ב-RPC → מוחק את משתמש האימות (פיצוי) כדי לא להשאיר יתום.
 */
export async function provisionClub(
  input: ProvisionClubInput,
): Promise<ProvisionClubResult> {
  const clubId = randomUUID();
  const tempPassword = generateTempPassword();

  const adminUserId = await adminCreateAuthUser({
    email: input.adminEmail,
    password: tempPassword,
    appMetadata: { club_id: clubId, is_platform: false },
  });

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("provision_club", {
      p_club_id: clubId,
      p_club_name: input.clubName,
      p_slug: input.slug,
      p_admin_user_id: adminUserId,
      p_admin_email: input.adminEmail,
      p_admin_full_name: input.adminFullName,
      p_season_name: input.seasonName,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    await adminDeleteAuthUser(adminUserId);
    throw err;
  }

  return { clubId, tempPassword };
}
