import { Shield, Crown, Users, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";

interface RoleCardProps {
  role: string;
  size?: string;
}

export function RoleCard({ role, size }: RoleCardProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'owner':
        return {
          label: 'Proprietário',
          icon: Crown,
          gradient: 'from-amber-500/10 to-amber-600/5',
          iconColor: 'text-amber-600',
          accentColor: 'border-amber-500/20',
        };
      case 'admin':
        return {
          label: 'Administrador',
          icon: Shield,
          gradient: 'from-blue-500/10 to-blue-600/5',
          iconColor: 'text-blue-600',
          accentColor: 'border-blue-500/20',
        };
      case 'manager':
        return {
          label: 'Gestor',
          icon: Users,
          gradient: 'from-purple-500/10 to-purple-600/5',
          iconColor: 'text-purple-600',
          accentColor: 'border-purple-500/20',
        };
      case 'employee':
        return {
          label: 'Funcionário',
          icon: Briefcase,
          gradient: 'from-green-500/10 to-green-600/5',
          iconColor: 'text-green-600',
          accentColor: 'border-green-500/20',
        };
      default:
        return {
          label: 'Membro',
          icon: Briefcase,
          gradient: 'from-muted/10 to-muted/5',
          iconColor: 'text-muted-foreground',
          accentColor: 'border-border',
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <Card 
      className={`
        relative overflow-hidden border-2 ${config.accentColor}
        bg-gradient-to-br ${config.gradient}
        hover:shadow-md transition-all duration-300
        hover:scale-105
      `}
    >
      <div className="p-4 flex items-center gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-12 h-12 rounded-xl
          bg-background/50 backdrop-blur-sm
          flex items-center justify-center
          ${config.iconColor}
          shadow-sm
        `}>
          <Icon className="h-6 w-6" strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
            Meu Cargo
          </p>
          <p className={`text-lg font-bold ${config.iconColor} truncate`}>
            {config.label}
          </p>
        </div>
      </div>

      {/* Decorative element */}
      <div className={`
        absolute -right-6 -bottom-6 w-24 h-24 rounded-full
        bg-gradient-to-br ${config.gradient}
        opacity-30 blur-2xl
      `} />
    </Card>
  );
}
