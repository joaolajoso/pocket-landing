-- Create experiences table for user professional experiences
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  experience_type TEXT NOT NULL CHECK (experience_type IN ('current_job', 'past_job', 'education', 'project', 'award', 'other')),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  description TEXT,
  logo_url TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraint: if is_current is true, end_date must be null
  CONSTRAINT check_current_no_end_date CHECK (
    (is_current = true AND end_date IS NULL) OR
    (is_current = false)
  )
);

-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own experiences"
  ON public.experiences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own experiences"
  ON public.experiences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experiences"
  ON public.experiences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experiences"
  ON public.experiences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view experiences of active profiles
CREATE POLICY "Public can view experiences from active profiles"
  ON public.experiences
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = experiences.user_id
      AND profiles.status = 'active'
    )
  );

-- Create index for better performance
CREATE INDEX idx_experiences_user_id ON public.experiences(user_id);
CREATE INDEX idx_experiences_position ON public.experiences(user_id, position);

-- Create trigger for updated_at
CREATE TRIGGER update_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();