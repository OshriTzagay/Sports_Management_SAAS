import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AssignableRole, StaffStatus, StaffUser } from "./types";

// צורת השורה הגולמית מ-Supabase (relation מקונן — אובייקט או מערך לפי ההסקה).
type RawStaffRow = {
  id: string;
  email: string;
  full_name: string | null;
  status: StaffStatus;
  role_id: string | null;
  person_type: string | null;
  person_id: string | null;
  roles: { name: string } | { name: string }[] | null;
};

/** משתמשי הצוות של המועדון (RLS מסנן ל-club_id). */
export async function listStaff(): Promise<StaffUser[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      "id, email, full_name, status, role_id, person_type, person_id, roles(name)",
    )
    .is("deleted_at", null)
    .order("created_at");
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawStaffRow[];
  return rows.map((row) => {
    const role = Array.isArray(row.roles) ? row.roles[0] : row.roles;
    return {
      id: row.id,
      email: row.email,
      full_name: row.full_name,
      status: row.status,
      role_id: row.role_id,
      role_name: role?.name ?? null,
      coach_id: row.person_type === "coach" ? row.person_id : null,
    };
  });
}

/** התפקידים שניתן לשייך למשתמש (תפקידי המועדון). */
export async function listAssignableRoles(): Promise<AssignableRole[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .is("deleted_at", null)
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as AssignableRole[];
}
