import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, Award } from 'lucide-react';

interface EventCustomSectionProps {
  section: any;
}

const EventCustomSection = ({ section }: EventCustomSectionProps) => {
  const icon = section.section_type === 'sponsors' ? Award : Info;
  const Icon = icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {section.section_type === 'sponsors' && section.content?.items ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {section.content.items.map((sponsor: any, index: number) => (
              <a
                key={index}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg border bg-card hover:border-primary transition-colors flex items-center justify-center"
              >
                {sponsor.logo_url ? (
                  <img
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    className="max-h-16 w-auto"
                  />
                ) : (
                  <span className="font-semibold text-center">{sponsor.name}</span>
                )}
              </a>
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {section.content?.text && (
              <p className="text-muted-foreground whitespace-pre-wrap">
                {section.content.text}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCustomSection;