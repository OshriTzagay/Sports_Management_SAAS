-- =============================================================================
-- must_change_password — דגל שמחייב משתמש להחליף סיסמה בכניסה הראשונה.
-- מוזרע true בהזמנת משתמש (סיסמה זמנית); מתאפס ב-updatePasswordAction.
-- ה-(app) layout מפנה ל-/set-password כל עוד הדגל דלוק.
-- =============================================================================
alter table public.users
  add column if not exists must_change_password boolean not null default false;
