const BUCKET = "club-logos";

/** URL ציבורי ללוגו לפי ה-path השמור (ה-bucket ציבורי). pure — לשימוש בכל מקום. */
export function logoPublicUrl(path: string | null): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${path}` : null;
}
