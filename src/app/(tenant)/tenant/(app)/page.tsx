import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TenantHome() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-text-primary text-xl font-bold">לוח הבקרה</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">ברוכים הבאים</CardTitle>
          <CardDescription>
            נווט מהתפריט הצדדי כדי לנהל עונות, קבוצות, שחקנים ותשלומים. דשבורד
            עם נתונים יתווסף בהמשך Phase 1.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
