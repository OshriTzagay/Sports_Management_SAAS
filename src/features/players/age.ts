/** גיל בגרות בישראל — מתחת לזה נדרש איש קשר אחראי (לא "עצמי"). */
export const MINOR_AGE = 18;

/** גיל בשנים מלאות מתאריך לידה, או null אם אין/לא תקין. */
export function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const dob = new Date(birthDate);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

/** האם השחקן קטין (מתחת לגיל 18). ללא תאריך לידה — לא מסומן כקטין. */
export function isMinor(birthDate: string | null): boolean {
  const age = calculateAge(birthDate);
  return age !== null && age < MINOR_AGE;
}
