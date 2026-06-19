import { type ReactNode } from "react";

/**
 * Layout של Tenant Plane (app). מעטפת בלבד — הכרום (סייד-בר) חי ב-(app)/layout
 * כדי שעמוד ה-login יישאר נקי בלי ניווט.
 */
export default function TenantLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-full flex-1 flex-col">{children}</div>;
}
