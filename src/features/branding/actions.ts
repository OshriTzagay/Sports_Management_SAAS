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

  revalidatePath("/tenant", "layout");
  return { error: null, ok: true };
}

const MAX_LOGO_BYTES = 1024 * 1024;
const ALLOWED_LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
};

export type UploadLogoState = { error: string | null; ok?: boolean };

/** העלאת לוגו מועדון ל-Storage (PNG/JPG בלבד, עד 1MB). */
export async function uploadLogoAction(
  _prev: UploadLogoState,
  formData: FormData,
): Promise<UploadLogoState> {
  const user = await requireUser();

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "לא נבחר קובץ" };
  }
  const ext = ALLOWED_LOGO_TYPES[file.type];
  if (!ext) return { error: "רק PNG או JPG" };
  if (file.size > MAX_LOGO_BYTES) return { error: "הקובץ גדול מ-1MB" };

  const path = `${user.club_id}/logo.${ext}`;
  const supabase = await createServerSupabaseClient();

  const { error: uploadError } = await supabase.storage
    .from("club-logos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) return { error: uploadError.message };

  const { error: saveError } = await supabase
    .from("club_branding")
    .upsert({ club_id: user.club_id, logo_path: path });
  if (saveError) return { error: saveError.message };

  revalidatePath("/tenant", "layout");
  return { error: null, ok: true };
}
