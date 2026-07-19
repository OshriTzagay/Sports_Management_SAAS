import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/features/tenant-auth";
import { SetPasswordForm } from "./set-password-form";

export default async function SetPasswordPage() {
  await requireUser();

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">בחירת סיסמה חדשה</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-text-muted text-sm">
            קבע סיסמה חדשה לחשבון. תוכל להתחבר איתה בפעם הבאה.
          </p>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
