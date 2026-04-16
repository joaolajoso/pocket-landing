import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Briefcase, Building2, Handshake, Zap } from 'lucide-react';
import { MatchResult } from '@/hooks/network/useNetworkingMatch';

interface MatchScoreCardProps {
  matchResult: MatchResult;
  compact?: boolean;
}

// Circular progress ring component
const ScoreRing = ({ score, matchType }: { score: number; matchType: string }) => {
  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (matchType === 'high-probability') return 'hsl(var(--primary))';
    if (matchType === 'interest') return 'hsl(var(--primary) / 0.7)';
    return 'hsl(var(--muted-foreground) / 0.4)';
  };

  const getEmoji = () => {
    if (score >= 80) return '🔥';
    if (score >= 50) return '✨';
    if (score >= 30) return '👋';
    return '🤝';
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="hsl(var(--muted) / 0.5)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-sm font-bold text-foreground leading-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}%
        </motion.span>
      </div>
    </div>
  );
};

// Small bar for category breakdown
const CategoryBar = ({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  delay: number;
}) => (
  <div className="flex items-center gap-2">
    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[11px] text-muted-foreground truncate">{label}</span>
        <span className="text-[11px] font-medium text-foreground ml-1">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay }}
        />
      </div>
    </div>
  </div>
);

// Tag pill
const TagPill = ({ label, type }: { label: string; type: 'role' | 'industry' | 'goal' }) => {
  const styles = {
    role: 'bg-primary/10 text-primary border-primary/20',
    industry: 'bg-accent/80 text-accent-foreground border-accent',
    goal: 'bg-secondary text-secondary-foreground border-secondary',
  };

  const icons = {
    role: Briefcase,
    industry: Building2,
    goal: Target,
  };

  const Icon = icons[type];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[type]}`}>
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
};

const getMatchLabel = (matchType: string) => {
  if (matchType === 'high-probability') return 'Alta Compatibilidade';
  if (matchType === 'interest') return 'Possível Interesse';
  return 'Baixa Compatibilidade';
};

const MatchScoreCard = ({ matchResult, compact = false }: MatchScoreCardProps) => {
  // Parse reasons to extract category-level scores
  const breakdown = useMemo(() => {
    const { reasons, commonTags } = matchResult;

    // Count goal matches from reasons (format: "Goal ↔ Target")
    const goalReasons = reasons.filter(r => r.includes('↔') && !r.startsWith('Papéis'));
    const roleReasons = reasons.filter(r => r.startsWith('Papéis em comum'));
    const industryReasons = reasons.filter(r => r.includes('indústria'));

    // Estimate sub-scores from the overall score weights
    const hasGoals = goalReasons.length > 0;
    const hasRoles = roleReasons.length > 0 || commonTags.roles.length > 0;
    const hasIndustries = industryReasons.length > 0 || commonTags.industries.length > 0;

    // Approximate sub-scores proportionally
    const goalScore = hasGoals ? Math.min(goalReasons.length * 33, 100) : 0;
    const roleScore = hasRoles ? Math.min((commonTags.roles.length || 1) * 50, 100) : 0;
    const industryScore = hasIndustries ? Math.min((commonTags.industries.length || 1) * 50, 100) : 0;
    const intentScore = matchResult.score > 0 ? 100 : 0;

    return { goalScore, roleScore, industryScore, intentScore };
  }, [matchResult]);

  const allTags = useMemo(() => {
    const seen = new Set<string>();
    const tags: { label: string; type: 'role' | 'industry' | 'goal' }[] = [];
    const addUnique = (items: string[], type: 'role' | 'industry' | 'goal') => {
      items.forEach(item => {
        if (!seen.has(item)) {
          seen.add(item);
          tags.push({ label: item, type });
        }
      });
    };
    addUnique(matchResult.commonTags.goals, 'goal');
    addUnique(matchResult.commonTags.roles, 'role');
    addUnique(matchResult.commonTags.industries, 'industry');
    return tags;
  }, [matchResult.commonTags]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50">
        <ScoreRing score={matchResult.score} matchType={matchResult.matchType} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {getMatchLabel(matchResult.matchType)}
          </p>
          {matchResult.reasons.length > 0 && (
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {matchResult.reasons[0]}
            </p>
          )}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {allTags.slice(0, 3).map((tag, i) => (
                <TagPill key={i} label={tag.label} type={tag.type} />
              ))}
              {allTags.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{allTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="rounded-xl border border-border/50 bg-muted/30 overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with ring */}
      <div className="flex items-center gap-4 p-4 pb-3">
        <ScoreRing score={matchResult.score} matchType={matchResult.matchType} />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">
              {getMatchLabel(matchResult.matchType)}
            </h4>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Compatibilidade baseada em objetivos, papéis e indústrias
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="px-4 pb-3 space-y-2.5">
        <CategoryBar
          icon={Target}
          label="Objetivos"
          value={breakdown.goalScore}
          color="hsl(var(--primary))"
          delay={0.1}
        />
        <CategoryBar
          icon={Briefcase}
          label="Papéis"
          value={breakdown.roleScore}
          color="hsl(var(--primary) / 0.75)"
          delay={0.2}
        />
        <CategoryBar
          icon={Building2}
          label="Indústrias"
          value={breakdown.industryScore}
          color="hsl(var(--primary) / 0.55)"
          delay={0.3}
        />
        <CategoryBar
          icon={Zap}
          label="Intenção"
          value={breakdown.intentScore}
          color="hsl(var(--primary) / 0.4)"
          delay={0.4}
        />
      </div>

      {/* Tags & Insights */}
      {(allTags.length > 0 || matchResult.reasons.length > 0) && (
        <div className="px-4 pb-4 pt-1 border-t border-border/30">
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {allTags.map((tag, i) => (
                <TagPill key={i} label={tag.label} type={tag.type} />
              ))}
            </div>
          )}

          {matchResult.reasons.length > 0 && (
            <div className="mt-2.5 space-y-1">
              {matchResult.reasons.slice(0, 3).map((reason, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Handshake className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-[11px] text-muted-foreground leading-tight">{reason}</span>
                </div>
              ))}
              {matchResult.reasons.length > 3 && (
                <span className="text-[10px] text-muted-foreground pl-4.5">
                  +{matchResult.reasons.length - 3} mais
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MatchScoreCard;
