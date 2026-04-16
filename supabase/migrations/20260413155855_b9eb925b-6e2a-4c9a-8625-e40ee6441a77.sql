
-- Create fictitious WebSummit 2036 event for testing
INSERT INTO events (
  id, title, description, event_date, end_date, location, city, country,
  category, organization, access_type, created_by, organization_id,
  image_url, is_featured
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'WebSummit 2036',
  'The world''s largest technology conference returns to Lisbon in 2036. Join 70,000+ attendees for groundbreaking talks, networking, and innovation.',
  '2036-11-10 09:00:00+00',
  '2036-11-13 23:00:00+00',
  'Altice Arena, Lisbon',
  'Lisbon',
  'Portugal',
  'Technology',
  'WebSummit',
  'public',
  'cfb95fe6-0de9-4401-89bb-156657a6818f',
  '2fd9cd6a-34dc-4e1e-803f-cce0acacd05a',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  true
);

-- Add Victor as participant with registered status and checked in
INSERT INTO event_participants (
  event_id, user_id, role, status, checked_in, checked_in_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '47963c84-0914-4f29-8bd5-7a88581a8cc9',
  'participant',
  'registered',
  true,
  now()
);
