import { NextResponse, type NextRequest } from "next/server";

import { resolveArea } from "@/lib/areas";
import { refreshSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const area = resolveArea(request.headers.get("host"));
  const url = request.nextUrl.clone();

  // rewrite פנימי לפי subdomain — ה-URL שהמשתמש רואה נשאר נקי.
  let response: NextResponse;
  if (area && !url.pathname.startsWith(`/${area}`)) {
    url.pathname = `/${area}${url.pathname === "/" ? "" : url.pathname}`;
    response = NextResponse.rewrite(url, { request });
  } else {
    response = NextResponse.next({ request });
  }

  await refreshSession(request, response);
  return response;
}

export const config = {
  matcher: [
    // כל הנתיבים פרט לקבצים סטטיים ולתמונות.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
