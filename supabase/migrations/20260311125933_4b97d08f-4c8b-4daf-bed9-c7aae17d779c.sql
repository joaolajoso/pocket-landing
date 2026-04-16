
-- Add send_review flag to event_stands
ALTER TABLE public.event_stands ADD COLUMN IF NOT EXISTS send_review boolean DEFAULT false;

-- Create stand_reviews table for storing pitch reviews
CREATE TABLE public.stand_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  stand_id uuid REFERENCES public.event_stands(id) ON DELETE CASCADE NOT NULL,
  reviewer_user_id uuid NOT NULL,
  candidate_user_id uuid NOT NULL,
  meeting_request_id uuid REFERENCES public.event_meeting_requests(id) ON DELETE CASCADE NOT NULL,
  clarity_score smallint NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 5),
  fit_score smallint NOT NULL CHECK (fit_score >= 0 AND fit_score <= 5),
  motivation_score smallint NOT NULL CHECK (motivation_score >= 0 AND motivation_score <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(meeting_request_id)
);

-- Enable RLS
ALTER TABLE public.stand_reviews ENABLE ROW LEVEL SECURITY;

-- Reviewer can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
  ON public.stand_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_user_id = auth.uid());

-- Users can view reviews they created or received
CREATE POLICY "Users can view related reviews"
  ON public.stand_reviews FOR SELECT TO authenticated
  USING (reviewer_user_id = auth.uid() OR candidate_user_id = auth.uid());

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON public.stand_reviews FOR UPDATE TO authenticated
  USING (reviewer_user_id = auth.uid());
