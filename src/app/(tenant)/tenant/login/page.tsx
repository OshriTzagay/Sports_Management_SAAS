import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantLoginForm } from "./login-form";

export default function TenantLoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            כניסה למערכת המועדון
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TenantLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
