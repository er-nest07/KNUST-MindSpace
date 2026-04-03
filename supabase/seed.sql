-- Seed script for MindSpace KNUST.
-- Replace UUID placeholders with real auth.users IDs from your Supabase project.

-- Example counsellors (must exist in auth.users first)
insert into public.profiles (
  id, email, role, display_name, visibility, is_verified_counsellor, counsellor_title, counsellor_bio
)
values
  ('00000000-0000-0000-0000-000000000101', 'dr.mensah@knust.edu.gh', 'counsellor', 'Dr. Akosua Mensah', 'identified', true, 'Licensed Clinical Psychologist', 'Student wellness, academic stress and anxiety support.'),
  ('00000000-0000-0000-0000-000000000102', 'kwame.asante@knust.edu.gh', 'counsellor', 'Mr. Kwame Asante', 'identified', true, 'Counselling Psychologist', 'Grief counselling, social anxiety, and emotional regulation.'),
  ('00000000-0000-0000-0000-000000000103', 'ama.adjei@knust.edu.gh', 'counsellor', 'Ms. Ama Adjei', 'identified', true, 'Mental Health Counsellor', 'Identity support and relationship counselling.')
on conflict (id) do nothing;

-- Example students (must exist in auth.users first)
insert into public.profiles (id, email, role, visibility, pseudonym)
values
  ('00000000-0000-0000-0000-000000000201', 'student1@knust.edu.gh', 'student', 'anonymous', null),
  ('00000000-0000-0000-0000-000000000202', 'student2@knust.edu.gh', 'student', 'pseudonym', 'HopefulHeart'),
  ('00000000-0000-0000-0000-000000000203', 'student3@knust.edu.gh', 'student', 'anonymous', null)
on conflict (id) do nothing;

insert into public.posts (id, author_id, content, topic_tag, is_private, is_crisis, is_approved)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Exam week has me completely overwhelmed. I am not sleeping well and my chest gets tight before every paper.', 'academic', false, false, true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202', 'Since losing my aunt, I feel heavy all the time. Small things trigger tears and I do not know how to process this grief.', 'grief', false, false, true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000203', 'I feel like everyone else belongs except me. Is anyone else dealing with imposter syndrome here?', 'identity', false, false, true)
on conflict (id) do nothing;

insert into public.comments (post_id, author_id, content)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'You are not alone. Try short focused study blocks and grounding exercises before each exam. We can also schedule private support.'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000102', 'I am very sorry for your loss. Grief has no fixed timeline. If you want, we can talk privately and build coping steps together.'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000201', 'I feel this too. You are definitely not the only one.')
on conflict do nothing;

insert into public.programmes (id, name, description, duration_days, checkin_frequency)
values
  ('20000000-0000-0000-0000-000000000001', 'Exam Stress Reset', 'Two-week support track for exam anxiety and study pressure.', 14, 'daily'),
  ('20000000-0000-0000-0000-000000000002', 'Grief and Loss Support', 'Compassionate guided support while processing loss.', 60, 'every 2 days'),
  ('20000000-0000-0000-0000-000000000003', 'Sleep and Recovery', 'Build practical sleep hygiene habits with check-ins.', 21, 'daily')
on conflict (id) do nothing;

insert into public.conversations (
  id, student_id, counsellor_id, ai_summary, status, last_message, last_message_at
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    'Student reports exam-related anxiety with physical panic symptoms before entering exam halls.',
    'active',
    'Thanks, the breathing strategy helped this morning.',
    now() - interval '4 hours'
  )
on conflict (id) do nothing;

insert into public.messages (conversation_id, sender_id, content, is_ai)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'I panic before entering the exam hall and it gets hard to breathe.', false),
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Thank you for sharing. Let us practice a short grounding exercise you can use before each paper.', false)
on conflict do nothing;

insert into public.enrolments (
  id, student_id, counsellor_id, programme_id, custom_notes, status, progress, total_days
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    '20000000-0000-0000-0000-000000000001',
    'Focus on panic symptoms and pre-exam anxiety.',
    'active',
    6,
    14
  )
on conflict (id) do nothing;
