import { type ReactNode } from "react";

/** Layout של Control Plane (admin) — נפרד מ-Tenant. auth ייווסף בהמשך. */
export default function ControlPlaneLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-border bg-bg-surface border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <span className="text-text-primary text-sm font-medium">
            פאנל ניהול הפלטפורמה
          </span>
          <span className="bg-info-bg text-info-text ms-2 rounded-sm px-2 py-0.5 text-xs font-medium">
            Control Plane
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
    </div>
  );
}
