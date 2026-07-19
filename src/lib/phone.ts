/**
 * נרמול מספר טלפון ישראלי ל-E.164 (‎+972…) עבור Supabase/Twilio.
 * מקבל 05X-XXXXXXX / 0XXXXXXXX / +972… / 972…; מחזיר null אם לא תקין.
 */
export function normalizeIsraeliPhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-()]/g, "");
  if (/^\+972\d{8,9}$/.test(digits)) return digits;
  if (/^972\d{8,9}$/.test(digits)) return `+${digits}`;
  if (/^0\d{8,9}$/.test(digits)) return `+972${digits.slice(1)}`;
  return null;
}
