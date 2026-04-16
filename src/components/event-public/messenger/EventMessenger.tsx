import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useEventMessenger } from '@/hooks/network/useEventMessenger';
import ConversationList from './ConversationList';
import ChatView from './ChatView';
import SupportChatView from './SupportChatView';

interface EventMessengerProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialReceiverId?: string;
  initialMessage?: string;
}

const EventMessenger = ({ eventId, open, onOpenChange, initialReceiverId, initialMessage }: EventMessengerProps) => {
  const isMobile = useIsMobile();
  const [showSupport, setShowSupport] = useState(false);
  const {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loadMessages,
    sendMeetingRequest,
    sendMessage,
    updateRequestStatus
  } = useEventMessenger(eventId);

  // Handle initial meeting request from outside
  useEffect(() => {
    if (open && initialReceiverId && initialMessage) {
      sendMeetingRequest(initialReceiverId, initialMessage);
    }
  }, [open, initialReceiverId, initialMessage]);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    loadMessages(id);
  };

  const handleBack = () => {
    if (showSupport) {
      setShowSupport(false);
    } else if (activeConversation) {
      setActiveConversation(null);
    } else {
      onOpenChange(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  const content = (
    <div className="flex flex-col h-full">
      {showSupport ? (
        <SupportChatView
          eventId={eventId}
          onBack={handleBack}
        />
      ) : activeConv ? (
        <ChatView
          conversation={activeConv}
          messages={messages}
          eventId={eventId}
          onBack={handleBack}
          onSendMessage={sendMessage}
          onUpdateStatus={updateRequestStatus}
        />
      ) : (
        <ConversationList
          conversations={conversations}
          onSelect={handleSelectConversation}
          onBack={() => onOpenChange(false)}
          onOpenSupport={() => setShowSupport(true)}
          eventId={eventId}
        />
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <div className="px-4 pb-6 pt-2 h-[75vh] overflow-hidden flex flex-col">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-4 h-[70vh] max-h-[600px] flex flex-col">
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default EventMessenger;
