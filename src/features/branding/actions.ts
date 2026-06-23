"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/features/tenant-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  displayName: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : null)),
  primaryColor: z
    .union([
      z.string().regex(/^#[0-9a-fA-F]{6}$/, "צבע לא תקין"),
      z.literal(""),
    ])
    .optional()
    .transform((v) => (v ? v : null)),
});

export type UpdateBrandingState = { error: string | null; ok?: boolean };

/** עדכון branding המועדון (upsert לפי club_id). */
export async function updateBrandingAction(
  _prev: UpdateBrandingState,
  formData: FormData,
): Promise<UpdateBrandingState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    displayName: formData.get("displayName"),
    primaryColor: formData.get("primaryColor"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("club_branding").upsert({
    club_id: user.club_id,
    display_name: parsed.data.displayName,
    primary_color: parsed.data.primaryColor,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { error: null, ok: true };
}
