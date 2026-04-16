
-- Create the Websummit 2036 event by Loog Websites
DO $$
DECLARE
  event_id UUID := gen_random_uuid();
  loog_org_id UUID := 'befbc901-1b34-4a46-af5e-02f6122340e6';
  loog_owner_id UUID := 'a572405c-9103-40f1-ba91-2bc67b05e1c9';
  pocketcv_org_id UUID := '2fd9cd6a-34dc-4e1e-803f-cce0acacd05a';
  pocketcv_owner_id UUID := 'cfb95fe6-0de9-4401-89bb-156657a6818f';
  area_main_id UUID := gen_random_uuid();
  area_startup_id UUID := gen_random_uuid();
  area_networking_id UUID := gen_random_uuid();
  onboarding_link_id TEXT := encode(gen_random_bytes(10), 'hex');
  stand_id UUID := gen_random_uuid();
  organizer_participant_id UUID := gen_random_uuid();
  stand_participant_id UUID := gen_random_uuid();
BEGIN
  -- Insert event
  INSERT INTO public.events (
    id, title, description, event_date, end_date, location, city, country,
    organization_id, created_by, access_type, category, event_type,
    event_url, is_featured, total_stands, internal_event
  ) VALUES (
    event_id,
    'Websummit 2036',
    'O maior evento de tecnologia e inovação do mundo. Reúne mais de 70.000 participantes de 160 países, com speakers de topo, startups revolucionárias e oportunidades únicas de networking. Este ano com foco especial em IA, sustentabilidade e Web3.',
    '2036-11-04 09:00:00+00',
    '2036-11-07 22:00:00+00',
    'Altice Arena & FIL',
    'Lisboa',
    'Portugal',
    loog_org_id,
    loog_owner_id,
    'public',
    'Technology',
    'conference',
    'https://websummit.com',
    true,
    150,
    false
  );

  -- Create event areas
  INSERT INTO public.event_areas (id, event_id, name, description) VALUES
    (area_main_id, event_id, 'Main Stage', 'Palco principal com keynotes e painéis de alto nível'),
    (area_startup_id, event_id, 'Startup Pavilion', 'Área dedicada a startups e demonstrações de produto'),
    (area_networking_id, event_id, 'Networking Lounge', 'Espaço premium para reuniões e networking');

  -- Create onboarding link for PocketCV stand
  INSERT INTO public.onboarding (signup_link_id, event_id, registration_type, used, used_by, used_at)
  VALUES (onboarding_link_id, event_id, 'event_stand', true, pocketcv_owner_id, now());

  -- Create PocketCV stand
  INSERT INTO public.event_stands (
    id, event_id, stand_number, stand_name, company_name, company_email,
    assigned_user_id, onboarding_link_id, is_active
  ) VALUES (
    stand_id, event_id, 42, 'Stand A42',
    'PocketCV', 'hello@pocketcv.pt',
    pocketcv_owner_id, onboarding_link_id, true
  );

  -- Add Loog Websites owner as organizer participant
  INSERT INTO public.event_participants (
    id, event_id, user_id, role, status, checked_in, checked_in_at
  ) VALUES (
    organizer_participant_id, event_id, loog_owner_id, 'organizer', 'confirmed', true, now()
  );

  -- Add PocketCV owner as stand participant
  INSERT INTO public.event_participants (
    id, event_id, user_id, role, status, checked_in, area_id
  ) VALUES (
    stand_participant_id, event_id, pocketcv_owner_id, 'stand', 'confirmed', false, area_startup_id
  );

  -- Create landing config for the event
  INSERT INTO public.event_landing_config (
    event_id, event_name, description, show_payment, payment_amount, payment_deadline
  ) VALUES (
    event_id,
    'Websummit 2036',
    'Junte-se a mais de 70.000 líderes de tecnologia, empreendedores e investidores no maior evento tech do mundo.',
    false,
    NULL,
    NULL
  );

  -- Create some announcements
  INSERT INTO public.event_announcements (event_id, created_by, title, message, is_active) VALUES
    (event_id, loog_owner_id, 'Bem-vindos ao Websummit 2036!', 'Estamos entusiasmados por receber todos os participantes. Consultem o programa completo na app e não percam o keynote de abertura às 10h no Main Stage.', true),
    (event_id, loog_owner_id, 'Networking Hour', 'Hoje das 18h às 20h no Networking Lounge. Bebidas e finger food incluídos. Oportunidade perfeita para fazer conexões valiosas!', true);

  -- Create sample meeting requests
  INSERT INTO public.event_meeting_requests (event_id, sender_id, receiver_id, message, status) VALUES
    (event_id, loog_owner_id, pocketcv_owner_id, 'Olá! Gostaria de conhecer melhor o PocketCV e discutir uma possível parceria para os nossos clientes.', 'pending');

  -- Create custom content sections
  INSERT INTO public.event_custom_content (event_id, section_type, title, content, position, is_active) VALUES
    (event_id, 'schedule', 'Programa', '{"sessions": [{"title": "Keynote de Abertura", "time": "10:00", "speaker": "João Silva", "description": "O futuro da tecnologia em Portugal"}, {"title": "Painel: IA e Negócios", "time": "14:00", "speaker": "Vários", "description": "Como a IA está a transformar empresas"}, {"title": "Workshop: Networking Digital", "time": "16:00", "speaker": "PocketCV", "description": "Ferramentas modernas para networking profissional"}]}'::jsonb, 1, true),
    (event_id, 'sponsors', 'Patrocinadores', '{"sponsors": [{"name": "Loog Websites", "tier": "platinum"}, {"name": "PocketCV", "tier": "gold"}]}'::jsonb, 2, true);

END $$;
