import { ReactNode } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface SplitScreenLayoutProps {
  editor: ReactNode;
  preview: ReactNode;
}

export const SplitScreenLayout = ({ editor, preview }: SplitScreenLayoutProps) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      {/* Editor Panel */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full overflow-auto">
          {editor}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Preview Panel */}
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full">
          {preview}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
