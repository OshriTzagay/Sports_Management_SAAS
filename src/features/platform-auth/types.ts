/** פרופיל משתמש פלטפורמה (Control Plane). יוחלף ב-generated types כשיהיה Docker. */
export interface PlatformUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "support";
}
