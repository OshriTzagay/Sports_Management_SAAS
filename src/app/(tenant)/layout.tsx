import Link from "next/link";
import { type ReactNode } from "react";

const NAV = [
  { href: "/", label: "בית" },
  { href: "/seasons", label: "עונות" },
];

/** Layout של Tenant Plane (app) — האזור של המועדון. branding בהמשך. */
export default function TenantLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-border bg-bg-surface border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
          <span className="text-text-primary text-sm font-medium">
            מערכת ניהול המועדון
          </span>
          <nav className="text-text-muted flex items-center gap-4 text-sm">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 p-6">{children}</main>
    </div>
  );
}
