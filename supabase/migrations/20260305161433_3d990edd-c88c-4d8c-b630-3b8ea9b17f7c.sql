-- Allow event organizers/creators to view profile_views of event participants
CREATE POLICY "Event organizers can view participant profile views"
ON public.profile_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.event_participants ep
    JOIN public.events e ON e.id = ep.event_id
    WHERE ep.user_id = profile_views.profile_id
      AND (
        e.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.organization_members om
          WHERE om.organization_id = e.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
        OR EXISTS (
          SELECT 1 FROM public.event_participants ep2
          WHERE ep2.event_id = e.id
            AND ep2.user_id = auth.uid()
            AND ep2.role = 'organizer'
        )
      )
  )
);

-- Allow event organizers to view all meeting requests for their events
CREATE POLICY "Event organizers can view event meeting requests"
ON public.event_meeting_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_meeting_requests.event_id
      AND (
        e.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.organization_members om
          WHERE om.organization_id = e.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
        OR EXISTS (
          SELECT 1 FROM public.event_participants ep
          WHERE ep.event_id = e.id
            AND ep.user_id = auth.uid()
            AND ep.role = 'organizer'
        )
      )
  )
);

-- Allow event organizers to view messages in their event's meeting requests
CREATE POLICY "Event organizers can view event messages"
ON public.event_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.event_meeting_requests emr
    JOIN public.events e ON e.id = emr.event_id
    WHERE emr.id = event_messages.meeting_request_id
      AND (
        e.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.organization_members om
          WHERE om.organization_id = e.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
        OR EXISTS (
          SELECT 1 FROM public.event_participants ep
          WHERE ep.event_id = e.id
            AND ep.user_id = auth.uid()
            AND ep.role = 'organizer'
        )
      )
  )
);

-- Allow event organizers to view scheduled meetings for their events
CREATE POLICY "Event organizers can view event scheduled meetings"
ON public.event_scheduled_meetings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_scheduled_meetings.event_id
      AND (
        e.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.organization_members om
          WHERE om.organization_id = e.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.status = 'active'
        )
        OR EXISTS (
          SELECT 1 FROM public.event_participants ep
          WHERE ep.event_id = e.id
            AND ep.user_id = auth.uid()
            AND ep.role = 'organizer'
        )
      )
  )
);