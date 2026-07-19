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

  redirect("/");
}
