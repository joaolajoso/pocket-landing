import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNetworkingPreferences } from '@/hooks/profile/useNetworkingPreferences';
import { Sparkles, Briefcase, Target, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MATCHMAKING_ROLES as ROLES, MATCHMAKING_INDUSTRIES as INDUSTRIES, MATCHMAKING_GOALS as GOALS, TAG_LIMITS } from '@/constants/matchmaking-tags';

const NetworkingPreferencesTab = () => {
  const { preferences, loading, toggleTag, hasPreferences } = useNetworkingPreferences();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Carregando preferências...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - More direct and actionable */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Preferências de Match</h2>
        <p className="text-muted-foreground">
          Ajude-nos a conectá-lo com as pessoas certas. Quanto mais específico, melhores os matches.
        </p>
      </div>

      {/* Roles Section */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">Quem sou eu</CardTitle>
              <CardDescription className="text-sm">Os seus papéis no mercado</CardDescription>
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">{preferences.professional_roles.length}/{TAG_LIMITS.professional_roles}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => {
              const isSelected = preferences.professional_roles.includes(role);
              const atLimit = !isSelected && preferences.professional_roles.length >= TAG_LIMITS.professional_roles;
              return (
                <Button
                  key={role}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={atLimit}
                  className={cn('transition-all rounded-full', isSelected && 'shadow-sm', atLimit && 'opacity-40')}
                  onClick={() => toggleTag('professional_roles', role)}
                >
                  {role}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Industries Section */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">A minha área</CardTitle>
              <CardDescription className="text-sm">Setores em que atua</CardDescription>
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">{preferences.industries.length}/{TAG_LIMITS.industries}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => {
              const isSelected = preferences.industries.includes(industry);
              const atLimit = !isSelected && preferences.industries.length >= TAG_LIMITS.industries;
              return (
                <Button
                  key={industry}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={atLimit}
                  className={cn('transition-all rounded-full', isSelected && 'shadow-sm', atLimit && 'opacity-40')}
                  onClick={() => toggleTag('industries', industry)}
                >
                  {industry}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">O que procuro</CardTitle>
              <CardDescription className="text-sm">Os seus objetivos no networking</CardDescription>
            </div>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">{preferences.networking_goals.length}/{TAG_LIMITS.networking_goals}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((goal) => {
              const isSelected = preferences.networking_goals.includes(goal);
              const atLimit = !isSelected && preferences.networking_goals.length >= TAG_LIMITS.networking_goals;
              return (
                <Button
                  key={goal}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  disabled={atLimit}
                  className={cn('transition-all rounded-full', isSelected && 'shadow-sm', atLimit && 'opacity-40')}
                  onClick={() => toggleTag('networking_goals', goal)}
                >
                  {goal}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Summary - More visual and celebratory */}
      {hasPreferences && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 animate-pulse">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Perfil ativo para matches!</p>
                  <p className="text-xs text-muted-foreground">
                    As suas preferências estão configuradas e está visível para conexões relevantes
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.professional_roles.length > 0 && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {preferences.professional_roles.length} {preferences.professional_roles.length === 1 ? 'papel' : 'papéis'}
                  </Badge>
                )}
                {preferences.industries.length > 0 && (
                  <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                    {preferences.industries.length} {preferences.industries.length === 1 ? 'área' : 'áreas'}
                  </Badge>
                )}
                {preferences.networking_goals.length > 0 && (
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
                    {preferences.networking_goals.length} {preferences.networking_goals.length === 1 ? 'objetivo' : 'objetivos'}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NetworkingPreferencesTab;
