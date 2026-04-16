import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User, Mail, Briefcase, FileText, Linkedin, Globe, Phone, Check, Sparkles, Trophy, AlertCircle, Target, Building2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { ProfilePhotoUploader } from '@/components/dashboard/tabs/overview/profile-form/ProfilePhotoUploader';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNetworkingPreferences } from '@/hooks/profile/useNetworkingPreferences';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { MATCHMAKING_ROLES as ROLES, MATCHMAKING_INDUSTRIES as INDUSTRIES, MATCHMAKING_GOALS as GOALS, TAG_LIMITS } from '@/constants/matchmaking-tags';

interface EventProfileTabProps {
  onProfileComplete: (isComplete: boolean) => void;
}

const EventProfileTab = ({ onProfileComplete }: EventProfileTabProps) => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadProfilePhoto, deleteProfilePhoto } = useProfile();
  const { preferences, loading: preferencesLoading, toggleTag, hasPreferences } = useNetworkingPreferences();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    job_title: '',
    headline: '',
    bio: '',
    linkedin: '',
    website: '',
    phone_number: ''
  });
  const [saving, setSaving] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  // Check if celebration was already shown for this user
  const getCelebrationKey = () => `profile_celebration_shown_${user?.id}`;
  const hasAlreadyCelebrated = () => {
    if (!user?.id) return true;
    return localStorage.getItem(getCelebrationKey()) === 'true';
  };
  const markCelebrationShown = () => {
    if (user?.id) {
      localStorage.setItem(getCelebrationKey(), 'true');
    }
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        job_title: profile.job_title || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        linkedin: profile.linkedin || '',
        website: profile.website || '',
        phone_number: profile.phone_number || ''
      });
    }
  }, [profile]);

  const completionData = useMemo(() => {
    const fields = [
      { key: 'name', label: 'Nome', weight: 20, filled: !!formData.name },
      { key: 'email', label: 'Email', weight: 15, filled: !!formData.email },
      { key: 'job_title', label: 'Cargo', weight: 20, filled: !!formData.job_title },
      { key: 'headline', label: 'Headline', weight: 15, filled: !!formData.headline },
      { key: 'bio', label: 'Bio', weight: 10, filled: !!formData.bio && formData.bio.length >= 20 },
      { key: 'linkedin', label: 'LinkedIn', weight: 10, filled: !!formData.linkedin },
      { key: 'photo', label: 'Foto', weight: 5, filled: !!profile?.photo_url },
      { key: 'match', label: 'Perfil Match', weight: 5, filled: hasPreferences }
    ];

    const totalWeight = fields.reduce((acc, f) => acc + f.weight, 0);
    const completedWeight = fields.filter(f => f.filled).reduce((acc, f) => acc + f.weight, 0);
    const percentage = Math.round((completedWeight / totalWeight) * 100);
    const missingFields = fields.filter(f => !f.filled);

    return {
      percentage,
      isComplete: percentage === 100,
      missingFields,
      fields
    };
  }, [formData, profile?.photo_url, hasPreferences]);

  // Notify parent of completion status
  useEffect(() => {
    onProfileComplete(completionData.isComplete);
  }, [completionData.isComplete, onProfileComplete]);

  const [showCelebrationBanner, setShowCelebrationBanner] = useState(false);

  // Trigger celebration when reaching 100% for the first time ever
  useEffect(() => {
    if (completionData.isComplete && !hasAlreadyCelebrated()) {
      markCelebrationShown();
      setShowCelebrationBanner(true);
      triggerCelebration();
    }
  }, [completionData.isComplete]);

  const triggerCelebration = () => {
    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    toast({
      title: '🎉 Parabéns!',
      description: 'O seu perfil está completo! Agora tem acesso total ao networking.',
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      toast({
        title: 'Perfil atualizado',
        description: 'As suas informações foram guardadas com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível guardar as alterações.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getProgressColor = () => {
    if (completionData.percentage === 100) return 'bg-green-500';
    if (completionData.percentage >= 70) return 'bg-yellow-500';
    return 'bg-primary';
  };

  if (loading || preferencesLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Profile Completion Badge - Floating */}
      {!completionData.isComplete && (
        <Card 
          className="border-yellow-500/50 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20 transition-colors"
          onClick={() => setShowCompletionDialog(true)}
        >
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/20">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Perfil incompleto</p>
                  <p className="text-xs text-muted-foreground">
                    Complete para aceder ao networking
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-yellow-600">{completionData.percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Celebration - only first time */}
      {showCelebrationBanner && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Perfil 100% completo!</p>
                <p className="text-sm text-muted-foreground">
                  Tem acesso total ao networking
                </p>
              </div>
              <Badge variant="default" className="ml-auto bg-green-500">
                <Check className="h-3 w-3 mr-1" />
                Completo
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Completion Dialog */}
      <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Complete o seu perfil
            </DialogTitle>
            <DialogDescription>
              Um perfil completo aumenta as suas chances de conexões relevantes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm font-bold">{completionData.percentage}%</span>
              </div>
              <Progress 
                value={completionData.percentage} 
                className="h-3"
                indicatorClassName={getProgressColor()}
              />
            </div>
            
            {completionData.missingFields.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Campos em falta:</p>
                <div className="flex flex-wrap gap-2">
                  {completionData.missingFields.map((field) => (
                    <Badge key={field.key} variant="outline">
                      {field.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => setShowCompletionDialog(false)}
              className="w-full"
            >
              Completar agora
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Percentagem de Perfil completo</span>
            <span className="text-2xl font-bold text-primary">{completionData.percentage}%</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={completionData.percentage} 
            className="h-3"
            indicatorClassName={getProgressColor()}
          />
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <ProfilePhotoUploader
              displayName={formData.name || '?'}
              photoUrl={profile?.photo_url || ''}
              onUpload={async (file) => {
                const url = await uploadProfilePhoto(file);
                return url;
              }}
              onDelete={async () => {
                const result = await deleteProfilePhoto();
                return result;
              }}
              disabled={saving}
              className="h-16 w-16"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">Foto de perfil</p>
              <p className="text-xs text-muted-foreground">
                Toque para alterar a foto
              </p>
            </div>
            {profile?.photo_url && (
              <Badge variant="outline" className="text-green-600">
                <Check className="h-3 w-3 mr-1" />
              </Badge>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Nome *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="O seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title" className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                Cargo *
              </Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="Ex: Product Manager na Empresa XYZ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="headline" className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Headline *
              </Label>
              <Input
                id="headline"
                value={formData.headline}
                onChange={(e) => handleInputChange('headline', e.target.value)}
                placeholder="Uma frase que te define profissionalmente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Bio *
                <span className="text-xs text-muted-foreground">(mín. 20 caracteres)</span>
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Conte um pouco sobre si, a sua experiência e interesses..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {formData.bio.length}/20 caracteres mínimos
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-1">
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
          >
            {saving ? 'A guardar...' : 'Guardar alterações'}
          </Button>
        </CardContent>
      </Card>

      {/* Match Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Perfil de Match
          </CardTitle>
          <CardDescription>
            Ajude-nos a conectá-lo com as pessoas certas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Quem sou eu */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Quem sou eu</p>
                <p className="text-xs text-muted-foreground">Os seus papéis no mercado</p>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground ml-auto tabular-nums">{preferences.professional_roles.length}/3</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((role) => {
                const isSelected = preferences.professional_roles.includes(role);
                const atLimit = !isSelected && preferences.professional_roles.length >= 3;
                return (
                  <Button
                    key={role}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={atLimit}
                    className={cn('transition-all rounded-full text-xs h-7 px-2.5', isSelected && 'shadow-sm', atLimit && 'opacity-40')}
                    onClick={() => toggleTag('professional_roles', role)}
                  >
                    {role}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* A minha área */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">A minha área</p>
                <p className="text-xs text-muted-foreground">Setores em que atua</p>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground ml-auto tabular-nums">{preferences.industries.length}/3</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.map((industry) => {
                const isSelected = preferences.industries.includes(industry);
                const atLimit = !isSelected && preferences.industries.length >= 3;
                return (
                  <Button
                    key={industry}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={atLimit}
                    className={cn('transition-all rounded-full text-xs h-7 px-2.5', isSelected && 'shadow-sm', atLimit && 'opacity-40')}
                    onClick={() => toggleTag('industries', industry)}
                  >
                    {industry}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* O que procuro */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">O que procuro</p>
                <p className="text-xs text-muted-foreground">Os seus objetivos no networking</p>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground ml-auto tabular-nums">{preferences.networking_goals.length}/6</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map((goal) => {
                const isSelected = preferences.networking_goals.includes(goal);
                const atLimit = !isSelected && preferences.networking_goals.length >= 6;
                return (
                  <Button
                    key={goal}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    disabled={atLimit}
                    className={cn('transition-all rounded-full text-xs h-7 px-2.5', isSelected && 'shadow-sm', atLimit && 'opacity-40')}
                    onClick={() => toggleTag('networking_goals', goal)}
                  >
                    {goal}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventProfileTab;
