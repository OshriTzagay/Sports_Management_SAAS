import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * נחיתה ניטרלית — מוצגת רק כשאין subdomain מוכר (למשל localhost נקי).
 * בפועל המשתמשים מגיעים דרך admin.* (Control Plane) או app.* (Tenant).
 */
export default function RootLanding() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            מערכת ניהול מועדוני ספורט
          </CardTitle>
          <CardDescription>בחר אזור גישה (בפיתוח מקומי):</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <a
            className="text-primary-500 hover:underline"
            href="http://admin.localhost:3000"
          >
            ← פאנל הפלטפורמה (admin.localhost:3000)
          </a>
          <a
            className="text-primary-500 hover:underline"
            href="http://app.localhost:3000"
          >
            ← מערכת המועדון (app.localhost:3000)
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
