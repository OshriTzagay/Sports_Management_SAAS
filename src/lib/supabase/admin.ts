import "server-only";

/**
 * פעולות Admin מול Supabase דרך ה-secret key — עוקף RLS, **שרת בלבד**.
 * מימוש ב-fetch (ולא ב-supabase-js) כדי להימנע מדרישת ה-WebSocket של ה-Realtime
 * client תחת Node < 22.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

function adminHeaders(): HeadersInit {
  if (!url || !secret) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY");
  }
  return {
    apikey: secret,
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

interface CreateAuthUserInput {
  email: string;
  password: string;
  appMetadata: Record<string, unknown>;
  /** טלפון E.164 אופציונלי — מאושר מיידית כדי לאפשר כניסה ב-SMS OTP. */
  phone?: string;
}

/** יוצר משתמש אימות (auth.users) ומחזיר את ה-id. */
export async function adminCreateAuthUser(
  input: CreateAuthUserInput,
): Promise<string> {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      email_confirm: true,
      app_metadata: input.appMetadata,
      ...(input.phone ? { phone: input.phone, phone_confirm: true } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`createAuthUser failed: ${res.status} ${await res.text()}`);
  }
  const user = (await res.json()) as { id: string };
  return user.id;
}

/** מוחק משתמש אימות — לפיצוי (compensation) כשהקמת מועדון נכשלת באמצע. */
export async function adminDeleteAuthUser(userId: string): Promise<void> {
  await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}
