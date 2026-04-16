import { useRef } from 'react';
import pocketcvLogoWhite from '@/assets/pocketcv-logo-white-slogan.png';
import { toPng } from 'html-to-image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Share2, Download, Trophy, Users, Eye, Store, MessageCircle, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { EventRecapData } from '@/hooks/useEventRecap';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface EventRecapCardProps {
  recap: EventRecapData;
  compact?: boolean;
}

const rankMedal = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '';
};

export const EventRecapCard = ({ recap, compact }: EventRecapCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleShare = async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#1a1025',
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `recap-${recap.eventTitle}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My ${recap.eventTitle} Recap`,
          text: `I made ${recap.stats.connections} connections at ${recap.eventTitle}!`,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = `recap-${recap.eventTitle}.png`;
        link.href = dataUrl;
        link.click();
        toast({ title: 'Image downloaded!', description: 'Share it on your social media' });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const statItems = [
    { icon: Users, label: 'Connections', value: recap.stats.connections, color: 'text-purple-300' },
    { icon: Eye, label: 'Profile Views', value: recap.stats.profileViews, color: 'text-blue-300' },
    { icon: Store, label: 'Stands Visited', value: recap.stats.standsVisited, color: 'text-emerald-300' },
    { icon: MessageCircle, label: 'Messages', value: recap.stats.messagesSent, color: 'text-pink-300' },
    { icon: CalendarCheck, label: 'Meetings', value: recap.stats.meetingsScheduled, color: 'text-amber-300' },
  ];

  return (
    <div className="space-y-4">
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{
          background: 'linear-gradient(135deg, #1a1025 0%, #2d1b4e 30%, #4c1d95 60%, #6d28d9 100%)',
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-violet-600/10 blur-3xl" />

        {/* Header */}
        <div className="relative z-10 space-y-1 mb-6">
          <p className="text-xs font-medium tracking-widest text-purple-300 uppercase">Event Recap</p>
          <h2 className="text-xl font-bold leading-tight">{recap.eventTitle}</h2>
          <p className="text-sm text-purple-200/70">
            {format(new Date(recap.eventDate), "d 'de' MMMM yyyy", { locale: pt })}
          </p>
        </div>

        {/* Badges */}
        {recap.badges.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-2 mb-6">
            {recap.badges.map((badge) => (
              <motion.div
                key={badge.type}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <Badge className="bg-white/15 backdrop-blur-sm border-white/20 text-white gap-1.5 py-1 px-3">
                  <span>{badge.icon}</span>
                  <span className="font-semibold">{badge.label}</span>
                  {badge.rank <= 3 && <span className="text-xs">{rankMedal(badge.rank)}</span>}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mb-6">
          {statItems.filter(s => s.value > 0 || !compact).slice(0, compact ? 3 : 5).map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-purple-200/60 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Connections Avatars */}
        {recap.connections.length > 0 && !compact && (
          <div className="relative z-10 mb-4">
            <p className="text-xs text-purple-200/60 uppercase tracking-wider mb-2">People you connected with</p>
            <div className="flex -space-x-2 overflow-hidden">
              {recap.connections.slice(0, 8).map((conn) => (
                <Avatar key={conn.id} className="w-8 h-8 border-2 border-[#2d1b4e]">
                  <AvatarImage src={conn.photo_url || undefined} />
                  <AvatarFallback className="bg-purple-700 text-white text-xs">
                    {conn.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {recap.connections.length > 8 && (
                <div className="w-8 h-8 rounded-full bg-purple-700 border-2 border-[#2d1b4e] flex items-center justify-center text-[10px] font-bold">
                  +{recap.connections.length - 8}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PocketCV Branding */}
        <div className="relative z-10 flex flex-col items-center gap-2 pt-4 border-t border-white/10">
          <img src={pocketcvLogoWhite} alt="PocketCV" className="h-5 opacity-60" />
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] text-purple-300/50 tracking-wider font-medium">pocketcv.pt</span>
            <span className="text-[10px] text-purple-300/50">
              {recap.totalParticipants} participants
            </span>
          </div>
        </div>
      </div>

      {/* Share Button */}
      <div className="flex gap-2">
        <Button onClick={handleShare} className="flex-1 gap-2" size="sm">
          <Share2 className="w-4 h-4" />
          Share Recap
        </Button>
      </div>
    </div>
  );
};
