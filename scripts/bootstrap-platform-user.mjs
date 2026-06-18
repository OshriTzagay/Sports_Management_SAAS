/**
 * מקים את משתמש הפלטפורמה הראשון (Control Plane).
 * שימוש:  node scripts/bootstrap-platform-user.mjs <email> <password> [full_name]
 *
 * קורא NEXT_PUBLIC_SUPABASE_URL ו-SUPABASE_SECRET_KEY מ-.env.local, וקורא ישירות
 * ל-Supabase Auth/REST Admin API (secret key עוקף RLS) — בלי תלות ב-supabase-js.
 * מסמן app_metadata.is_platform=true (כדי ש-RLS יזהה אותו) ומוסיף רשומה ל-platform_users.
 */
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  const text = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of text.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

async function postJson(url, secret, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

async function main() {
  loadEnvLocal();
  const [email, password, fullName = null] = process.argv.slice(2);
  if (!email || !password) {
    throw new Error(
      "usage: node scripts/bootstrap-platform-user.mjs <email> <password> [full_name]",
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret)
    throw new Error("missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY");

  const user = await postJson(`${url}/auth/v1/admin/users`, secret, {
    email,
    password,
    email_confirm: true,
    app_metadata: { is_platform: true },
  });

  await postJson(`${url}/rest/v1/platform_users`, secret, {
    id: user.id,
    email,
    full_name: fullName,
    role: "admin",
  });

  console.log(`✓ platform user created: ${email} (${user.id})`);
}

main().catch((err) => {
  console.error("✗ bootstrap failed:", err.message ?? err);
  process.exit(1);
});
