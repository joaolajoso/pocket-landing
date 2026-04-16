import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Camera, Linkedin, Briefcase, FileText, UserCheck, AlertTriangle } from 'lucide-react';
import type { EventParticipant } from '@/hooks/useEventParticipants';

interface ParticipantInsightsPanelProps {
  participants: EventParticipant[];
}

interface InsightMetric {
  label: string;
  count: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  progressColor: string;
}

export const ParticipantInsightsPanel = ({ participants }: ParticipantInsightsPanelProps) => {
  const insights = useMemo(() => {
    const total = participants.length;
    if (total === 0) return null;

    const withPhoto = participants.filter(p => p.user?.photo_url).length;
    const withLinkedin = participants.filter(p => p.user?.linkedin).length;
    const withHeadline = participants.filter(p => p.user?.headline || p.user?.job_title).length;
    const withBio = participants.filter(p => p.user?.bio).length;
    const onboardingDone = participants.filter(p => p.user?.onboarding_completed).length;
    const withOrg = participants.filter(p => p.user?.organization_id).length;

    // Average profile completeness
    const completenessScores = participants.map(p => {
      let score = 0;
      const u = p.user;
      if (!u) return 0;
      if (u.name) score += 15;
      if (u.photo_url) score += 25;
      if (u.linkedin) score += 15;
      if (u.headline || u.job_title) score += 15;
      if (u.bio) score += 10;
      if (u.email) score += 10;
      if (u.organization_id) score += 10;
      return Math.min(score, 100);
    });
    const avgCompleteness = Math.round(completenessScores.reduce((a, b) => a + b, 0) / total);

    const metrics: InsightMetric[] = [
      { label: 'Com Foto', count: withPhoto, total, icon: <Camera className="h-3.5 w-3.5" />, color: 'text-blue-400', progressColor: 'bg-blue-500' },
      { label: 'Com LinkedIn', count: withLinkedin, total, icon: <Linkedin className="h-3.5 w-3.5" />, color: 'text-sky-400', progressColor: 'bg-sky-500' },
      { label: 'Com Headline', count: withHeadline, total, icon: <Briefcase className="h-3.5 w-3.5" />, color: 'text-violet-400', progressColor: 'bg-violet-500' },
      { label: 'Com Bio', count: withBio, total, icon: <FileText className="h-3.5 w-3.5" />, color: 'text-emerald-400', progressColor: 'bg-emerald-500' },
      { label: 'Onboarding Completo', count: onboardingDone, total, icon: <UserCheck className="h-3.5 w-3.5" />, color: 'text-green-400', progressColor: 'bg-green-500' },
      { label: 'Com Empresa', count: withOrg, total, icon: <Briefcase className="h-3.5 w-3.5" />, color: 'text-amber-400', progressColor: 'bg-amber-500' },
    ];

    const incompleteProfiles = participants.filter(p => {
      const u = p.user;
      return u && (!u.photo_url || !u.linkedin || !u.headline);
    }).length;

    return { metrics, avgCompleteness, incompleteProfiles, total };
  }, [participants]);

  if (!insights) return null;

  return (
    <div className="space-y-4">
      {/* Completeness overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl p-4">
          <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Completude Média</p>
          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold text-white">{insights.avgCompleteness}%</p>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${insights.avgCompleteness}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-amber-500/20 to-amber-600/5 backdrop-blur-xl p-4">
          <p className="text-[11px] font-medium text-white/50 uppercase tracking-wider">Perfis Incompletos</p>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <p className="text-2xl font-bold text-white">{insights.incompleteProfiles}</p>
          </div>
          <p className="text-[11px] text-white/30 mt-1">Sem foto, LinkedIn ou headline</p>
        </div>
      </div>

      {/* Detailed metrics grid */}
      <div className="grid grid-cols-3 gap-2">
        {insights.metrics.map((metric) => {
          const pct = metric.total > 0 ? Math.round((metric.count / metric.total) * 100) : 0;
          return (
            <div key={metric.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className={metric.color}>{metric.icon}</span>
                <span className="text-[11px] font-medium text-white/50">{metric.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-white">{metric.count}</span>
                <span className="text-[11px] text-white/30">/ {metric.total}</span>
                <span className="text-[11px] text-white/40 ml-auto">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${metric.progressColor} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
