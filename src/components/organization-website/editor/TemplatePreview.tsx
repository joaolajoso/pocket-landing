import { OrganizationWebsite } from '@/types/organizationWebsite';
import { getTemplate } from '../templates';
import { LivePreviewFrame } from '../preview/LivePreviewFrame';

interface TemplatePreviewProps {
  templateId: string;
  website: OrganizationWebsite;
}

export const TemplatePreview = ({ templateId, website }: TemplatePreviewProps) => {
  const TemplateComponent = getTemplate(templateId);
  
  return (
    <div className="h-full">
      <LivePreviewFrame>
        <div className="scale-90 origin-top">
          <TemplateComponent website={website} />
        </div>
      </LivePreviewFrame>
    </div>
  );
};
