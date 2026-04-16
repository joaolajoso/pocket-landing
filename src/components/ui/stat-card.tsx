import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  subtitle?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  trend = "neutral",
  trendValue,
  subtitle,
  icon: Icon,
  className,
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card className={cn("p-6 hover:shadow-md transition-shadow", className)}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {(Icon || TrendIcon) && (
          <div className="p-2 rounded-lg bg-muted">
            {Icon ? (
              <Icon className="h-4 w-4 text-muted-foreground" />
            ) : TrendIcon ? (
              <TrendIcon
                className={cn(
                  "h-4 w-4",
                  trend === "up" && "text-green-500",
                  trend === "down" && "text-red-500"
                )}
              />
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </span>
          {trendValue && (
            <span
              className={cn(
                "text-sm font-medium",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground"
              )}
            >
              {trend === "up" && "+"}
              {trendValue}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
