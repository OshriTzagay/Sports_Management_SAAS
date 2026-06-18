import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            מערכת ניהול מועדוני ספורט
          </CardTitle>
          <CardDescription>
            Phase 0 — רכיבי היסוד (shadcn/ui מותאם ל-design system) פעילים
            ב-RTL.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-3">
            <Button>כפתור ראשי</Button>
            <Button variant="secondary">משני</Button>
            <Button variant="outline">קווי</Button>
            <Button variant="destructive">מחיקה</Button>
            <Button variant="ghost">רפאים</Button>
          </div>

          <Input placeholder="שם השחקן..." />

          <div className="flex flex-wrap gap-2">
            <Badge variant="success">שולם</Badge>
            <Badge variant="warning">ממתין</Badge>
            <Badge variant="danger">פיגור</Badge>
            <Badge variant="info">חלקי</Badge>
            <Badge variant="muted">טיוטה</Badge>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
