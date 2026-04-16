import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Target, ArrowRight } from "lucide-react";
import { useNetworkingPreferences } from "@/hooks/profile/useNetworkingPreferences";

interface MatchmakingTagsOverviewProps {
  onNavigateToMatchmaking: () => void;
}

const MatchmakingTagsOverview = ({ onNavigateToMatchmaking }: MatchmakingTagsOverviewProps) => {
  const { preferences, loading, hasPreferences } = useNetworkingPreferences();
  
  // Show max 3 tags per category, and max 6 total
  const allTags = [
    ...preferences.professional_roles.slice(0, 2).map(tag => ({ tag, type: 'role' as const })),
    ...preferences.industries.slice(0, 2).map(tag => ({ tag, type: 'industry' as const })),
    ...preferences.networking_goals.slice(0, 2).map(tag => ({ tag, type: 'goal' as const })),
  ].slice(0, 6);
  
  const totalTags = 
    preferences.professional_roles.length + 
    preferences.industries.length + 
    preferences.networking_goals.length;
  
  const remainingTags = totalTags - allTags.length;
  
  const getTagIcon = (type: 'role' | 'industry' | 'goal') => {
    switch (type) {
      case 'role': return <Briefcase className="h-3 w-3" />;
      case 'industry': return <Target className="h-3 w-3" />;
      case 'goal': return <Users className="h-3 w-3" />;
    }
  };

  const getTagVariant = (type: 'role' | 'industry' | 'goal') => {
    switch (type) {
      case 'role': return 'default';
      case 'industry': return 'secondary';
      case 'goal': return 'outline';
    }
  };
  
  return (
    <div className="mb-4 md:mb-6">
      <div className="flex items-start justify-between gap-2 mb-3 px-1">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium truncate">Matchmaking</h3>
          <p className="text-xs text-muted-foreground truncate">Suas preferências de networking</p>
        </div>
        <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
      <div>
        {loading ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-6 bg-white/10 rounded-full w-20"></div>
              ))}
            </div>
          </div>
        ) : hasPreferences ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {allTags.map(({ tag, type }, index) => (
                <Badge 
                  key={`${type}-${index}`} 
                  variant={getTagVariant(type) as any}
                  className="text-xs flex items-center gap-1.5 py-1 px-2.5"
                >
                  {getTagIcon(type)}
                  <span className="truncate max-w-[120px]">{tag}</span>
                </Badge>
              ))}
              {remainingTags > 0 && (
                <Badge variant="outline" className="text-xs py-1 px-2.5 text-muted-foreground">
                  +{remainingTags} mais
                </Badge>
              )}
            </div>
            
            <div className="pt-2 border-t border-white/10">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onNavigateToMatchmaking}
                className="text-xs w-full justify-center gap-1"
              >
                Ver e editar preferências
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma preferência definida</p>
            <p className="text-xs mt-1 mb-3">Configure suas preferências para encontrar conexões relevantes</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNavigateToMatchmaking}
              className="text-xs gap-1"
            >
              Configurar preferências
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchmakingTagsOverview;
