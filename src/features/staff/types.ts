export type StaffStatus = "active" | "inactive";

/** משתמש-צוות במועדון (staff). מיוצג מטבלת public.users + שם התפקיד. */
export interface StaffUser {
  id: string;
  email: string;
  full_name: string | null;
  role_id: string | null;
  role_name: string | null;
  status: StaffStatus;
}

/** תפקיד שניתן לשייך למשתמש (מטבלת roles של המועדון). */
export interface AssignableRole {
  id: string;
  name: string;
}
