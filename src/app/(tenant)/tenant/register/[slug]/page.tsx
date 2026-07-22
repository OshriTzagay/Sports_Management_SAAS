import { notFound } from "next/navigation";

import { brandStyleVars, logoPublicUrl } from "@/features/branding";
import { getRegistrationContext } from "@/features/registrations";
import { RegistrationForm } from "@/features/registrations/registration-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ctx = await getRegistrationContext(slug);
  if (!ctx) notFound();

  const logoUrl = logoPublicUrl(ctx.logoPath);
  const closed = !ctx.open || !ctx.seasonId || ctx.feeAgorot <= 0;

  return (
    <div
      className="from-primary-50/50 to-bg flex flex-1 items-center justify-center bg-gradient-to-b p-6"
      style={brandStyleVars(ctx.primaryColor)}
    >
      <div className="border-border bg-bg-surface w-full max-w-md rounded-2xl border p-6 shadow-lg">
        <div className="flex flex-col items-center gap-2 pb-4 text-center">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="border-border size-16 rounded-full border object-cover"
            />
          ) : (
            <div className="bg-primary-500 flex size-16 items-center justify-center rounded-full text-2xl font-bold text-white">
              {ctx.clubName[0] ?? "⚽"}
            </div>
          )}
          <h1 className="text-text-primary text-xl font-bold">
            {ctx.clubName}
          </h1>
          <p className="text-text-muted text-sm">
            {closed
              ? "הרשמה"
              : `הרשמה${ctx.seasonName ? ` · עונה ${ctx.seasonName}` : ""}`}
          </p>
        </div>

        {closed ? (
          <p className="text-text-muted py-6 text-center text-sm">
            ההרשמה סגורה כרגע. לפרטים — פנה למועדון.
          </p>
        ) : (
          <RegistrationForm
            slug={slug}
            feeAgorot={ctx.feeAgorot}
            currency={ctx.currency}
          />
        )}
      </div>
    </div>
  );
}
