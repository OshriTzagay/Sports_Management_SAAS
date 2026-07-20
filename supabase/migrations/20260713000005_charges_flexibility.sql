-- =============================================================================
-- גמישות חיוב לעמותה — הנחות/מלגות/פטורים, תשלום חלקי, ותשלום ידני (מזומן).
--   charges: original/discount/reason + סטטוסים partially_paid/waived.
--   payments: method (כרטיס/מזומן/העברה/צ'ק) + provider 'manual' לרישום ידני.
-- amount_agorot = הסכום נטו לתשלום (אחרי הנחה). original/discount לתיעוד ושקיפות.
-- =============================================================================

alter table public.charges
  add column if not exists original_amount_agorot bigint
    check (original_amount_agorot is null or original_amount_agorot >= 0),
  add column if not exists discount_agorot bigint not null default 0
    check (discount_agorot >= 0),
  add column if not exists discount_reason text;

-- הרחבת ה-state machine: + partially_paid, + waived (פטור מלא).
alter table public.charges drop constraint charges_status_check;
alter table public.charges add constraint charges_status_check
  check (status in (
    'pending', 'partially_paid', 'paid', 'waived',
    'failed', 'refunded', 'cancelled'
  ));

-- אמצעי תשלום — לתמוך ברישום מזומן/העברה ידני לצד סליקה מקוונת.
alter table public.payments
  add column if not exists method text not null default 'card'
    check (method in ('card', 'cash', 'bank_transfer', 'check', 'other'));
