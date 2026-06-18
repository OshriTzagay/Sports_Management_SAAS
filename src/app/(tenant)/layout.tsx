import { type ReactNode } from "react";

/** Layout של Tenant Plane (app) — האזור של המועדון. branding/auth בהמשך. */
export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-border bg-bg-surface border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <span className="text-text-primary text-sm font-medium">
            מערכת ניהול המועדון
          </span>
          <span className="bg-primary-50 text-primary-700 ms-2 rounded-sm px-2 py-0.5 text-xs font-medium">
            Tenant
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
    </div>
  );
}
