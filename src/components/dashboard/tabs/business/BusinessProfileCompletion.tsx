
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { CompletionSection } from "@/hooks/useBusinessProfileCompletion";
import { cn } from "@/lib/utils";

interface BusinessProfileCompletionProps {
  sections: CompletionSection[];
  percentage: number;
  completedCount: number;
  totalCount: number;
  onSectionClick?: (accordionValue: string) => void;
}

export const BusinessProfileCompletion = ({
  sections,
  percentage,
  completedCount,
  totalCount,
  onSectionClick,
}: BusinessProfileCompletionProps) => {
  const getProgressColor = () => {
    if (percentage === 100) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-orange-500";
  };

  const getStatusLabel = () => {
    if (percentage === 100) return "Perfil completo!";
    if (percentage >= 60) return "Quase lá!";
    if (percentage >= 30) return "Bom progresso";
    return "Vamos começar";
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Perfil do Negócio
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getStatusLabel()} — {completedCount} de {totalCount} secções
          </p>
        </div>
        <div className={cn(
          "text-2xl font-bold tabular-nums",
          percentage === 100 ? "text-emerald-500" : "text-foreground"
        )}>
          {percentage}%
        </div>
      </div>

      {/* Progress Bar */}
      <Progress
        value={percentage}
        className="h-2 bg-muted"
        indicatorClassName={cn("transition-all duration-500", getProgressColor())}
      />

      {/* Section checklist */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => onSectionClick?.(section.accordionValue)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors",
              "hover:bg-accent/50",
              section.completed
                ? "text-muted-foreground"
                : "text-foreground font-medium"
            )}
          >
            {section.completed ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            )}
            <span className={cn(
              "truncate",
              section.completed && "line-through decoration-muted-foreground/30"
            )}>
              {section.label}
            </span>
            {!section.completed && (
              <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/40 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
