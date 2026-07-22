/**
 * ולידציית ת.ז. ישראלית — ספרת ביקורת (אלגוריתם משרד הפנים), לא רק "9 ספרות".
 * מקבל עד 9 ספרות (משלים באפסים משמאל). מחזיר false לקלט לא-מספרי/ריק.
 */
export function isValidIsraeliId(raw: string): boolean {
  const id = raw.trim();
  if (!/^\d{1,9}$/.test(id)) return false;

  const padded = id.padStart(9, "0");
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let digit = Number(padded[i]) * ((i % 2) + 1);
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 === 0;
}
