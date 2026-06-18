-- =============================================================================
-- Seed — קטלוג ההרשאות הגלובלי. idempotent (on conflict do nothing).
-- ה-roles לכל מועדון יורכבו מאוסף של אלה (Phase 3). כאן רק הקטלוג.
-- =============================================================================
insert into public.permissions (key, description) values
  ('seasons.view',    'צפייה בעונות'),
  ('seasons.manage',  'יצירה/עריכה/סגירה של עונות'),
  ('teams.view',      'צפייה בקבוצות'),
  ('teams.manage',    'יצירה/עריכה של קבוצות'),
  ('players.view',    'צפייה בשחקנים'),
  ('players.manage',  'יצירה/עריכה של שחקנים ושיבוצים'),
  ('coaches.view',    'צפייה במאמנים'),
  ('coaches.manage',  'יצירה/עריכה של מאמנים ושיוכים'),
  ('contacts.view',   'צפייה באנשי קשר'),
  ('contacts.manage', 'יצירה/עריכה של אנשי קשר'),
  ('payments.view',   'צפייה בחיובים ותשלומים'),
  ('payments.charge', 'יצירת חיובים ושליחת קישורי תשלום'),
  ('reports.view',    'צפייה בדוחות'),
  ('users.view',      'צפייה במשתמשי הצוות'),
  ('users.manage',    'הזמנה/עריכה של משתמשי צוות ותפקידים'),
  ('settings.manage', 'עריכת הגדרות המועדון ו-branding')
on conflict (key) do nothing;
