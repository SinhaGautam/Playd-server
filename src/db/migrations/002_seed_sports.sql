INSERT INTO sports (slug, name)
VALUES
  ('badminton', 'Badminton'),
  ('cricket', 'Cricket'),
  ('football', 'Football'),
  ('basketball', 'Basketball'),
  ('tennis', 'Tennis'),
  ('table-tennis', 'Table Tennis'),
  ('volleyball', 'Volleyball'),
  ('running', 'Running'),
  ('cycling', 'Cycling'),
  ('swimming', 'Swimming')
ON CONFLICT (slug) DO NOTHING;
