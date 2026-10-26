-- ============================================================
-- SyncNote – Demo Seed Data
-- Run AFTER applying 001_initial_schema.sql
-- ============================================================

-- Semester 1 B.Tech CSE Subjects
INSERT INTO subjects (name, subject_code, branch, semester, description) VALUES
  ('Engineering Mathematics-I',    'BAS-101', 'B.Tech CSE', 1, 'Calculus, matrices, differential equations, and linear algebra fundamentals.'),
  ('Engineering Physics',          'BAS-102', 'B.Tech CSE', 1, 'Wave optics, quantum mechanics, and semiconductor physics.'),
  ('Basic Electrical Engineering', 'BEE-101', 'B.Tech CSE', 1, 'DC circuits, AC analysis, and electrical machines basics.'),
  ('Programming for Problem Solving','KCS-101','B.Tech CSE',1, 'Introduction to C programming, algorithms, and problem-solving techniques.'),
  ('Engineering Graphics and Design','KEE-101','B.Tech CSE',1, 'Technical drawing, orthographic projections, and CAD fundamentals.'),
  ('Communication Skills',         'KHU-101', 'B.Tech CSE', 1, 'Professional communication, technical writing, and presentation skills.'),
  ('Environmental Science',        'KAN-101', 'B.Tech CSE', 1, 'Ecosystem, pollution, environmental management, and sustainability.'),
  ('Workshop Practice',            'KME-351', 'B.Tech CSE', 1, 'Basic workshop tools, manufacturing processes, and hands-on training.')
ON CONFLICT DO NOTHING;

-- Academic Events
INSERT INTO academic_events (title, description, event_date, category) VALUES
  ('Mid-Semester Examination',   'Semester 1 mid-term exams begin',          '2024-11-04', 'exam'),
  ('Diwali Holidays',            'University closed for Diwali celebrations', '2024-11-01', 'holiday'),
  ('Course Registration Deadline','Last date for semester course registration','2024-11-10', 'registration'),
  ('End-Semester Examination',   'Final exams for all semesters begin',       '2024-12-02', 'exam'),
  ('Annual Tech Fest',           'Inter-college technical festival',          '2024-11-22', 'academic')
ON CONFLICT DO NOTHING;

-- Rewards
INSERT INTO rewards (title, description, credit_cost) VALUES
  ('Amazon Gift Card – ₹500',     'Redeem SyncCredits for an Amazon gift voucher.',            2000),
  ('Course Completion Certificate','Official contribution certificate from the platform.',      1500),
  ('Premium Study Material Pack', 'Curated set of advanced study materials.',                  1000),
  ('SyncNote Pro Badge',          'Exclusive profile badge for top contributors.',               800),
  ('Stationery Kit',              'Premium stationery set delivered to your address.',           500),
  ('LinkedIn Shoutout',           'Recognition post on SyncNote official LinkedIn.',             300)
ON CONFLICT DO NOTHING;
