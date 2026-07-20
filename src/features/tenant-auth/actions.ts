"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { normalizeIsraeliPhone } from "@/lib/phone";

const credentialsSchema = z.object({
  email: z.string().email("אימייל לא תקין"),
  password: z.string().min(1, "סיסמה נדרשת"),
});

export type SignInState = { error: string | null };

/** התחברות משתמש מועדון. מצליח → redirect לדף הבית של אזור המועדון. */
export async function signInTenant(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "אימייל או סיסמה שגויים" };

  redirect("/");
}

export async function signOutTenant(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type PhoneOtpState = { error: string | null; sent?: boolean };

/**
 * שליחת קוד OTP ב-SMS. shouldCreateUser:false — רק טלפון של משתמש קיים
 * (שהוזמן מראש) יכול להתחבר; אין הרשמה עצמית.
 */
export async function sendPhoneOtp(
  _prev: PhoneOtpState,
  formData: FormData,
): Promise<PhoneOtpState> {
  const phone = normalizeIsraeliPhone(String(formData.get("phone") ?? ""));
  if (!phone) return { error: "מספר טלפון לא תקין" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    phone,
    options: { shouldCreateUser: false },
  });
  if (error) {
    return { error: "שליחת הקוד נכשלה. ודא שהמספר רשום במערכת." };
  }
  return { error: null, sent: true };
}

/** אימות קוד ה-SMS → יוצר session ו-redirect לדף הבית. */
export async function verifyPhoneOtp(
  _prev: PhoneOtpState,
  formData: FormData,
): Promise<PhoneOtpState> {
  const phone = normalizeIsraeliPhone(String(formData.get("phone") ?? ""));
  const token = String(formData.get("token") ?? "").trim();
  if (!phone || !token) return { error: "קוד לא תקין" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  if (error) return { error: "קוד שגוי או שפג תוקפו" };

  // יעד פנימי בלבד (מונע open-redirect). ברירת מחדל: דף הבית.
  const next = String(formData.get("next") ?? "/");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

const passwordSchema = z.object({
  password: z.string().min(8, "סיסמה חייבת לפחות 8 תווים"),
});

export type UpdatePasswordState = { error: string | null };

/** קביעת סיסמה חדשה למשתמש המחובר (למשל אחרי כניסה ב-SMS OTP). */
export async function updatePasswordAction(
  _prev: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "יש להתחבר תחילה" };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: "עדכון הסיסמה נכשל" };

  // ניקוי דגל "חובה להחליף סיסמה" (אם היה) — כניסה ראשונה הושלמה.
  await supabase
    .from("users")
    .update({ must_change_password: false })
    .eq("id", user.id);

  redirect("/");
}
