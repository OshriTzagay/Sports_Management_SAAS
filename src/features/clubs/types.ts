export interface Club {
  id: string;
  name: string;
  slug: string;
  status: "trial" | "active" | "suspended";
  created_at: string;
}

export interface ProvisionClubInput {
  clubName: string;
  slug: string;
  adminEmail: string;
  adminFullName: string;
  seasonName: string;
}

export interface ProvisionClubResult {
  clubId: string;
  /** סיסמה זמנית למנהל המועדון — מוצגת פעם אחת. (זרימת הזמנה במייל = Phase 3) */
  tempPassword: string;
}
