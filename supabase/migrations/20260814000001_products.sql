-- =============================================================================
-- תשלום לפי מוצר — הרחבת payment_plans לקטלוג "פריטי חיוב":
--   category — סוג המוצר (רישום/ביגוד/שנתי/תרומה/ספר/אחר), לקיבוץ.
--   variable_amount — סכום חופשי (לתרומה: המשלם קובע).
-- amount_agorot קיים (0 לתרומה בסכום חופשי).
-- =============================================================================
alter table public.payment_plans
  add column if not exists category text not null default 'other'
    check (category in ('registration', 'clothing', 'membership', 'donation', 'book', 'other')),
  add column if not exists variable_amount boolean not null default false;
