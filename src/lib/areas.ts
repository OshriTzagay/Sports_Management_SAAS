/**
 * שני אזורי הגישה של המערכת (אותו פרויקט, גבול נפרד):
 * Control Plane (admin.*) מול Tenant Plane (app.*).
 * ה-middleware עושה rewrite פנימי לסגמנט המתאים לפי ה-subdomain.
 */
export const AREAS = {
  controlPlane: "control-plane",
  tenant: "tenant",
} as const;

export type Area = (typeof AREAS)[keyof typeof AREAS];

/** מזהה את האזור מתוך ה-Host. מחזיר null אם אין subdomain מוכר (למשל localhost נקי). */
export function resolveArea(host: string | null): Area | null {
  const hostname = (host ?? "").split(":")[0]?.toLowerCase() ?? "";
  if (hostname.startsWith("admin.")) return AREAS.controlPlane;
  if (hostname.startsWith("app.")) return AREAS.tenant;
  return null;
}
