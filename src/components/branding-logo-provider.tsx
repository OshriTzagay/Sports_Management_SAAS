"use client";

import { createContext, useContext, type ReactNode } from "react";

const BrandingLogoContext = createContext<string | null>(null);

/** מספק את URL הלוגו של המועדון לרכיבי client (למשל ה-watermark במודאלים). */
export function BrandingLogoProvider({
  logoUrl,
  children,
}: {
  logoUrl: string | null;
  children: ReactNode;
}) {
  return (
    <BrandingLogoContext.Provider value={logoUrl}>
      {children}
    </BrandingLogoContext.Provider>
  );
}

export const useBrandingLogo = () => useContext(BrandingLogoContext);
