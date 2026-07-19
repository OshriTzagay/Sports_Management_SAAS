"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import { requirePermission } from "@/features/tenant-auth";
import { adminCreateAuthUser, adminDeleteAuthUser } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toUserMessage } from "@/lib/db-error";
import { normalizeIsraeliPhone } from "@/lib/phone";

/** סיסמה זמנית ~12 תווים (מוצגת פעם אחת למזמין; המשתמש מחליף בכניסה). */
function generateTempPassword(): string {
  return randomBytes(9).toString("base64url");
}

const optionalUuid = z
  .union([z.string().uuid(), z.literal("")])
  .optional()
  .transform((v) => (v ? v : null));

const inviteSchema = z.object({
  fullName: z.string().trim().min(2, "שם מלא נדרש"),
  email: z.string().trim().email("אימייל לא תקין"),
  roleId: z.string().uuid("יש לבחור תפקיד"),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  coachId: optionalUuid,
});

export type InviteStaffState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "success"; email: string; tempPassword: string };

/**
 * הזמנת משתמש-צוות (Owner בלבד — users.manage). יוצר משתמש אימות עם club_id
 * ב-app_metadata (כדי ש-RLS יעבוד), משייך תפקיד, ומחזיר סיסמה זמנית להעברה.
 * כשל בהוספת השורה → מחיקת משתמש האימות (פיצוי) כדי לא להשאיר יתום.
 */
export async function inviteStaffAction(
  _prev: InviteStaffState,
  formData: FormData,
): Promise<InviteStaffState> {
  const actor = await requirePermission("users.manage");

  const parsed = inviteSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    roleId: formData.get("roleId"),
    phone: formData.get("phone"),
    coachId: formData.get("coachId"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "קלט לא תקין",
    };
  }

  // טלפון אופציונלי — אם סופק, חייב להיות תקין (כדי לאפשר כניסה ב-SMS).
  let phone: string | undefined;
  if (parsed.data.phone) {
    const normalized = normalizeIsraeliPhone(parsed.data.phone);
    if (!normalized) return { status: "error", error: "מספר טלפון לא תקין" };
    phone = normalized;
  }

  const supabase = await createServerSupabaseClient();

  // ודא שהתפקיד שייך למועדון (RLS מחזיר רק תפקידי המועדון — הגנת עומק).
  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("id", parsed.data.roleId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!role) return { status: "error", error: "תפקיד לא תקין" };

  const tempPassword = generateTempPassword();
  let newUserId: string;
  try {
    newUserId = await adminCreateAuthUser({
      email: parsed.data.email,
      password: tempPassword,
      appMetadata: { club_id: actor.club_id, is_platform: false },
      phone,
    });
  } catch (err) {
    const msg = (err instanceof Error ? err.message : "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return { status: "error", error: "כבר קיים משתמש עם אימייל או טלפון זה" };
    }
    return { status: "error", error: "יצירת המשתמש נכשלה" };
  }

  const { error } = await supabase.from("users").insert({
    id: newUserId,
    club_id: actor.club_id,
    email: parsed.data.email,
    full_name: parsed.data.fullName,
    role_id: parsed.data.roleId,
    status: "active",
    ...(parsed.data.coachId
      ? { person_type: "coach", person_id: parsed.data.coachId }
      : {}),
  });
  if (error) {
    await adminDeleteAuthUser(newUserId); // פיצוי — לא להשאיר משתמש אימות יתום
    return {
      status: "error",
      error: toUserMessage(error, "כבר קיים משתמש עם אימייל זה"),
    };
  }

  revalidatePath("/tenant", "layout");
  return {
    status: "success",
    email: parsed.data.email,
    tempPassword,
  };
}

/** שינוי תפקיד למשתמש-צוות (Owner בלבד). אסור לשנות את התפקיד של עצמך. */
export async function changeStaffRoleAction(formData: FormData): Promise<void> {
  const actor = await requirePermission("users.manage");
  const parsed = z
    .object({ userId: z.string().uuid(), roleId: z.string().uuid() })
    .parse({
      userId: formData.get("userId"),
      roleId: formData.get("roleId"),
    });

  if (parsed.userId === actor.id) {
    throw new Error("לא ניתן לשנות את התפקיד של עצמך");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ role_id: parsed.roleId })
    .eq("id", parsed.userId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

/** הסרת משתמש-צוות (Owner בלבד). soft-delete לשורה + מחיקת חשבון האימות. */
export async function removeStaffAction(formData: FormData): Promise<void> {
  const actor = await requirePermission("users.manage");
  const userId = z.string().uuid().parse(formData.get("userId"));

  if (userId === actor.id) {
    throw new Error("לא ניתן להסיר את המשתמש של עצמך");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ deleted_at: new Date().toISOString(), status: "inactive" })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  // מחיקת חשבון האימות — משחרר את האימייל/טלפון לשימוש חוזר וחוסם כניסה מוחלטת.
  await adminDeleteAuthUser(userId);

  revalidatePath("/tenant", "layout");
}

/** קישור/ניתוק משתמש לכרטיס מאמן (Owner בלבד). מאפשר למאמן לנהל אימונים. */
export async function linkStaffCoachAction(formData: FormData): Promise<void> {
  await requirePermission("users.manage");
  const parsed = z
    .object({ userId: z.string().uuid(), coachId: optionalUuid })
    .parse({
      userId: formData.get("userId"),
      coachId: formData.get("coachId"),
    });

  const supabase = await createServerSupabaseClient();

  if (parsed.coachId) {
    // ודא שכרטיס המאמן שייך למועדון (RLS מחזיר רק את מאמני המועדון).
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("id", parsed.coachId)
      .is("deleted_at", null)
      .maybeSingle();
    if (!coach) throw new Error("כרטיס מאמן לא תקין");
  }

  const { error } = await supabase
    .from("users")
    .update(
      parsed.coachId
        ? { person_type: "coach", person_id: parsed.coachId }
        : { person_type: null, person_id: null },
    )
    .eq("id", parsed.userId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}

/** הפעלה/השבתה של משתמש-צוות (Owner בלבד). אסור לשנות את הסטטוס של עצמך. */
export async function setStaffStatusAction(formData: FormData): Promise<void> {
  const actor = await requirePermission("users.manage");
  const parsed = z
    .object({
      userId: z.string().uuid(),
      status: z.enum(["active", "inactive"]),
    })
    .parse({
      userId: formData.get("userId"),
      status: formData.get("status"),
    });

  if (parsed.userId === actor.id) {
    throw new Error("לא ניתן לשנות את הסטטוס של עצמך");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({ status: parsed.status })
    .eq("id", parsed.userId);
  if (error) throw new Error(error.message);

  revalidatePath("/tenant", "layout");
}
