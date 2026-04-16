import { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface LivePreviewFrameProps {
  children: React.ReactNode;
}

export const LivePreviewFrame = ({ children }: LivePreviewFrameProps) => {
  const [device, setDevice] = useState<DeviceType>('desktop');

  const deviceSizes = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Device Toggle Bar */}
      <div className="flex items-center justify-center gap-2 p-4 bg-background border-b">
        <Button
          variant={device === 'desktop' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDevice('desktop')}
        >
          <Monitor className="h-4 w-4 mr-2" />
          Desktop
        </Button>
        
        <Button
          variant={device === 'tablet' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDevice('tablet')}
        >
          <Tablet className="h-4 w-4 mr-2" />
          Tablet
        </Button>
        
        <Button
          variant={device === 'mobile' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDevice('mobile')}
        >
          <Smartphone className="h-4 w-4 mr-2" />
          Mobile
        </Button>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto transition-all duration-300" style={{ maxWidth: device === 'desktop' ? '100%' : undefined }}>
          <div 
            className={`bg-background shadow-lg mx-auto transition-all duration-300 ${deviceSizes[device]}`}
            style={{ minHeight: '600px' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
