import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ניהול מועדוני ספורט",
  description: "מערכת לניהול מועדוני ספורט — שחקנים, קבוצות, עונות ותשלומים",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      suppressHydrationWarning
      className={`${heebo.variable} h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextTopLoader
          color="var(--primary-500)"
          height={3}
          shadow="0 0 10px var(--primary-500), 0 0 5px var(--primary-500)"
          showSpinner={false}
          speed={300}
          crawlSpeed={200}
          easing="ease"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
