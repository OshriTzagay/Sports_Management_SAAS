"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePlatformUser } from "@/features/platform-auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { provisionClub } from "./provisioning";

const schema = z.object({
  clubName: z.string().min(2, "שם מועדון קצר מדי"),
  slug: z
    .string()
    .regex(/^[a-z0-9-]{2,}$/, "slug: אותיות לטיניות קטנות, מספרים ומקפים בלבד"),
  adminEmail: z.string().email("אימייל לא תקין"),
  adminFullName: z.string().min(2, "שם מנהל קצר מדי"),
  seasonName: z.string().min(1, "שם עונה נדרש"),
});

export type CreateClubState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | {
      status: "success";
      clubName: string;
      adminEmail: string;
      tempPassword: string;
    };

/** יצירת מועדון מה-Control Plane. authorization מפורש (default-deny) + ולידציה. */
export async function createClubAction(
  _prev: CreateClubState,
  formData: FormData,
): Promise<CreateClubState> {
  await requirePlatformUser();

  const parsed = schema.safeParse({
    clubName: formData.get("clubName"),
    slug: formData.get("slug"),
    adminEmail: formData.get("adminEmail"),
    adminFullName: formData.get("adminFullName"),
    seasonName: formData.get("seasonName"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      error: parsed.error.issues[0]?.message ?? "קלט לא תקין",
    };
  }

  try {
    const { tempPassword } = await provisionClub(parsed.data);
    revalidatePath("/control-plane");
    return {
      status: "success",
      clubName: parsed.data.clubName,
      adminEmail: parsed.data.adminEmail,
      tempPassword,
    };
  } catch (err) {
    return {
      status: "error",
      error: err instanceof Error ? err.message : "הקמת המועדון נכשלה",
    };
  }
}

const statusSchema = z.object({
  clubId: z.string().uuid(),
  status: z.enum(["trial", "active", "suspended"]),
});

/** השעיה/הפעלה של מועדון. authorization מפורש + audit (ב-RPC). */
export async function setClubStatusAction(formData: FormData): Promise<void> {
  await requirePlatformUser();

  const parsed = statusSchema.safeParse({
    clubId: formData.get("clubId"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("קלט לא תקין");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.rpc("set_club_status", {
    p_club_id: parsed.data.clubId,
    p_status: parsed.data.status,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/control-plane");
}
