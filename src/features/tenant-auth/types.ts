/** המשתמש (staff) המחובר באזור ה-Tenant. תמיד משויך למועדון יחיד. */
export interface CurrentUser {
  id: string;
  club_id: string;
  email: string;
  full_name: string | null;
  role_id: string | null;
  /** חובה להחליף סיסמה בכניסה הראשונה (סיסמה זמנית מהזמנה). */
  must_change_password: boolean;
}
