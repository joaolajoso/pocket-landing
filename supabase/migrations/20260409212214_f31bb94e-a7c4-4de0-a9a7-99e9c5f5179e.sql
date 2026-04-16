
-- Add organization_id to contact_submissions
ALTER TABLE public.contact_submissions 
ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_contact_submissions_organization_id ON public.contact_submissions(organization_id);

-- Add RLS policy for org members to view org submissions
CREATE POLICY "Organization members can view org submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (
  organization_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = contact_submissions.organization_id
    AND om.user_id = auth.uid()
    AND om.status = 'active'
    AND om.role IN ('owner', 'admin', 'manager')
  )
);
