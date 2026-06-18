import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ControlPlaneHome() {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">פאנל הפלטפורמה</CardTitle>
        <CardDescription>
          כאן ינוהלו המועדונים, המנויים והדשבורד הרוחבי. (האזור שלך — admin)
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
