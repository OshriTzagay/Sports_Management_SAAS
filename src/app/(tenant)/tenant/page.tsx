import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TenantHome() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">ברוכים הבאים</CardTitle>
        <CardDescription>
          כאן ינוהלו שחקנים, קבוצות, עונות ותשלומים של המועדון. (האזור של
          המועדון — app)
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
