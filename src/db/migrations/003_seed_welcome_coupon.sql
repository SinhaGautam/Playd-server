INSERT INTO coupons (
  code,
  description,
  duration_days,
  max_redemptions,
  active
)
VALUES (
  'WELCOME30',
  'New-user first month free',
  30,
  NULL,
  TRUE
)
ON CONFLICT (code) DO NOTHING;
