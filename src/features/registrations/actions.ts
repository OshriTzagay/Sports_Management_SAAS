"use server";

import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin-client";
import { isValidIsraeliId } from "@/lib/israeli-id";
import { normalizeIsraeliPhone } from "@/lib/phone";
import { calculateAge } from "@/features/players/age";
import { getRegistrationContext } from "./queries";

const ADULT_AGE = 18;

export type RegistrationFormState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | {
      status: "created";
      registrationId: string;
      amountAgorot: number;
      currency: string;
    };

function err(error: string): RegistrationFormState {
  return { status: "error", error };
}

/**
 * שלב 1 — יצירת טיוטת רישום (ציבורי, service role, מסונן ל-club מה-slug).
 * ולידציה: ת.ז. עם ספרת ביקורת, טלפון מנורמל. קטין/בוגר נגזר מהגיל.
 * הסכום נלקח מהשרת (הגדרות המועדון) — לעולם לא מהטופס.
 */
export async function submitRegistrationAction(
  _prev: RegistrationFormState,
  formData: FormData,
): Promise<RegistrationFormState> {
  const slug = String(formData.get("slug") ?? "");
  const ctx = await getRegistrationContext(slug);
  if (!ctx) return err("המועדון לא נמצא");
  if (!ctx.open) return err("ההרשמה סגורה כרגע. פנה למועדון.");
  if (!ctx.seasonId) return err("אין עונה פעילה. פנה למועדון.");
  if (ctx.feeAgorot <= 0) return err("דמי הרישום לא הוגדרו. פנה למועדון.");

  const playerFirst = String(formData.get("playerFirstName") ?? "").trim();
  const playerLast = String(formData.get("playerLastName") ?? "").trim();
  const playerNationalId = String(
    formData.get("playerNationalId") ?? "",
  ).trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  if (!playerFirst || !playerLast) return err("שם השחקן נדרש");
  if (!isValidIsraeliId(playerNationalId)) return err("ת.ז. שחקן לא תקינה");
  if (!birthDate) return err("תאריך לידה נדרש");
  const age = calculateAge(birthDate);
  if (age === null) return err("תאריך לידה לא תקין");
  const isSelf = age >= ADULT_AGE;

  let contactFirst: string;
  let contactLast: string | null;
  let contactNationalId: string;
  let relationship: string;

  if (isSelf) {
    // בוגר — הוא המשלם; ת.ז. + שם פעם אחת.
    contactFirst = playerFirst;
    contactLast = playerLast;
    contactNationalId = playerNationalId;
    relationship = "self";
  } else {
    contactFirst = String(formData.get("contactFirstName") ?? "").trim();
    contactLast = String(formData.get("contactLastName") ?? "").trim() || null;
    contactNationalId = String(formData.get("contactNationalId") ?? "").trim();
    relationship = String(formData.get("relationship") ?? "");
    if (!contactFirst) return err("שם המשלם נדרש");
    if (!isValidIsraeliId(contactNationalId)) return err("ת.ז. משלם לא תקינה");
    if (!["father", "mother", "guardian"].includes(relationship)) {
      return err("יש לבחור קרבה");
    }
  }

  const phone = normalizeIsraeliPhone(
    String(formData.get("contactPhone") ?? ""),
  );
  if (!phone) return err("טלפון משלם לא תקין");
  const emailRaw = String(formData.get("contactEmail") ?? "").trim();
  if (emailRaw && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailRaw)) {
    return err("אימייל לא תקין");
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("registrations")
    .insert({
      club_id: ctx.clubId,
      season_id: ctx.seasonId,
      status: "pending",
      is_self: isSelf,
      relationship,
      player_first_name: playerFirst,
      player_last_name: playerLast,
      player_national_id: playerNationalId,
      player_birth_date: birthDate,
      contact_first_name: contactFirst,
      contact_last_name: contactLast,
      contact_national_id: contactNationalId,
      contact_phone: phone,
      contact_email: emailRaw || null,
      amount_agorot: ctx.feeAgorot,
      vat_rate: ctx.vatRate,
      currency: ctx.currency,
    })
    .select("id")
    .single();
  if (error) return err("שמירת הרישום נכשלה");

  return {
    status: "created",
    registrationId: (data as { id: string }).id,
    amountAgorot: ctx.feeAgorot,
    currency: ctx.currency,
  };
}

export type PayState = { error: string | null; done?: boolean };

/**
 * שלב 2 — סימולציית תשלום (mock). מדמה webhook מוצלח: קורא ל-RPC המימוש.
 * כשיחובר Tranzila — ה-webhook האמיתי יקרא לאותו RPC.
 */
export async function payRegistrationMockAction(
  _prev: PayState,
  formData: FormData,
): Promise<PayState> {
  const parsed = z.string().uuid().safeParse(formData.get("registrationId"));
  if (!parsed.success) return { error: "רישום לא תקין" };

  const admin = createAdminSupabaseClient();
  const { error } = await admin.rpc("complete_registration", {
    p_registration_id: parsed.data,
    p_external_ref: `MOCK-${parsed.data.slice(0, 8)}`,
  });
  if (error) return { error: "התשלום נכשל" };

  return { error: null, done: true };
}
