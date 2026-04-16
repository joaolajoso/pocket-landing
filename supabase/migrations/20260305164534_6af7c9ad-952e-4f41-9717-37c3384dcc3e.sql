-- Backfill event_participant_metrics with profile_view entries from profile_views table
INSERT INTO public.event_participant_metrics (event_id, participant_id, metric_type, metadata, is_during_event, captured_at)
SELECT 
  ep.event_id,
  ep.user_id,
  'profile_view'::event_metric_type,
  jsonb_build_object('source', pv.source, 'backfilled', true),
  CASE 
    WHEN e.end_date IS NOT NULL THEN pv.timestamp BETWEEN e.event_date AND e.end_date
    ELSE pv.timestamp >= e.event_date
  END,
  pv.timestamp
FROM public.profile_views pv
JOIN public.event_participants ep ON ep.user_id = pv.profile_id
JOIN public.events e ON e.id = ep.event_id
WHERE pv.timestamp >= e.event_date
  AND (e.end_date IS NULL OR pv.timestamp <= e.end_date)
  AND pv.source NOT LIKE 'click:%'
ON CONFLICT DO NOTHING;

-- Backfill event_participant_metrics with link_click entries from profile_views where source LIKE 'click:%'
INSERT INTO public.event_participant_metrics (event_id, participant_id, metric_type, metadata, is_during_event, captured_at)
SELECT 
  ep.event_id,
  ep.user_id,
  'link_click'::event_metric_type,
  jsonb_build_object('source', pv.source, 'backfilled', true),
  CASE 
    WHEN e.end_date IS NOT NULL THEN pv.timestamp BETWEEN e.event_date AND e.end_date
    ELSE pv.timestamp >= e.event_date
  END,
  pv.timestamp
FROM public.profile_views pv
JOIN public.event_participants ep ON ep.user_id = pv.profile_id
JOIN public.events e ON e.id = ep.event_id
WHERE pv.timestamp >= e.event_date
  AND (e.end_date IS NULL OR pv.timestamp <= e.end_date)
  AND pv.source LIKE 'click:%'
ON CONFLICT DO NOTHING;

-- Backfill event_participant_metrics with lead_capture entries from contact_submissions
INSERT INTO public.event_participant_metrics (event_id, participant_id, metric_type, metadata, is_during_event, captured_at)
SELECT 
  ep.event_id,
  ep.user_id,
  'lead_capture'::event_metric_type,
  jsonb_build_object('contact_name', cs.name, 'contact_email', cs.email, 'backfilled', true),
  CASE 
    WHEN e.end_date IS NOT NULL THEN cs.created_at BETWEEN e.event_date AND e.end_date
    ELSE cs.created_at >= e.event_date
  END,
  cs.created_at
FROM public.contact_submissions cs
JOIN public.event_participants ep ON ep.user_id = cs.profile_owner_id
JOIN public.events e ON e.id = ep.event_id
WHERE cs.created_at >= e.event_date
  AND (e.end_date IS NULL OR cs.created_at <= e.end_date)
ON CONFLICT DO NOTHING;