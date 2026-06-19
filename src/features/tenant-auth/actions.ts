"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

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
