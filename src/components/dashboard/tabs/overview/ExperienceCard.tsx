import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Briefcase, Plus, Pencil, Trash2, GraduationCap, Award, FolderKanban, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useExperiences, Experience } from "@/hooks/useExperiences";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";
import { cn } from "@/lib/utils";
const ExperienceCard = () => {
  const { experiences, loading, addExperience, updateExperience, deleteExperience } = useExperiences();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const dateLocale = language === 'pt' ? ptBR : enUS;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    experience_type: 'current_job' as Experience['experience_type'],
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    logo_url: '',
  });

  const experienceTypeConfig = {
    current_job: {
      icon: Briefcase,
      label: t.experience.types.current_job,
      color: 'text-primary',
    },
    past_job: {
      icon: Briefcase,
      label: t.experience.types.past_job,
      color: 'text-muted-foreground',
    },
    education: {
      icon: GraduationCap,
      label: t.experience.types.education,
      color: 'text-blue-500',
    },
    project: {
      icon: FolderKanban,
      label: t.experience.types.project,
      color: 'text-purple-500',
    },
    award: {
      icon: Award,
      label: t.experience.types.award,
      color: 'text-amber-500',
    },
    other: {
      icon: Briefcase,
      label: t.experience.types.other,
      color: 'text-gray-500',
    },
  };

  const handleOpenDialog = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        company_name: experience.company_name,
        role: experience.role,
        experience_type: experience.experience_type,
        start_date: experience.start_date || '',
        end_date: experience.end_date || '',
        is_current: experience.is_current,
        description: experience.description || '',
        logo_url: experience.logo_url || '',
      });
    } else {
      setEditingExperience(null);
      setFormData({
        company_name: '',
        role: '',
        experience_type: 'current_job',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        logo_url: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.is_current ? null : (formData.end_date || null),
        description: formData.description || null,
        logo_url: formData.logo_url || null,
      };

      if (editingExperience) {
        await updateExperience(editingExperience.id, data);
      } else {
        await addExperience(data);
      }

      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving experience:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t.experience.deleteConfirm)) {
      await deleteExperience(id);
    }
  };

  const formatDateRange = (startDate: string | null, endDate: string | null, isCurrent: boolean) => {
    if (!startDate) return language === 'pt' ? 'Data não informada' : 'Date not provided';
    
    const start = format(new Date(startDate), 'MMM yyyy', { locale: dateLocale });
    
    if (isCurrent) {
      return `${start} - ${language === 'pt' ? 'Presente' : 'Present'}`;
    }
    
    if (endDate) {
      const end = format(new Date(endDate), 'MMM yyyy', { locale: dateLocale });
      return `${start} - ${end}`;
    }
    
    return start;
  };

  return (
    <>
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base md:text-lg font-semibold">{t.experience.title}</h3>
          </div>
          {experiences.length < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDialog()}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              {t.experience.add}
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.experience.loading}
            </div>
          ) : experiences.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mb-4">
                {t.experience.empty}
              </p>
              <Button onClick={() => handleOpenDialog()} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t.experience.addExperience}
              </Button>
            </div>
          ) : (
            experiences.map((exp) => {
              const config = experienceTypeConfig[exp.experience_type];
              const Icon = config.icon;
              
              return (
                <div
                  key={exp.id}
                  className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group"
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ${config.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm md:text-base truncate">
                          {exp.company_name}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {exp.role}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleOpenDialog(exp)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(exp.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatDateRange(exp.start_date, exp.end_date, exp.is_current)}
                    </p>
                    
                    {exp.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExperience ? t.experience.editExperience : t.experience.addExperience}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="experience_type">{t.experience.fields.type} *</Label>
              <Select
                value={formData.experience_type}
                onValueChange={(value: Experience['experience_type']) => 
                  setFormData({ ...formData, experience_type: value })
                }
              >
                <SelectTrigger id="experience_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(experienceTypeConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">
                {formData.experience_type === 'education' ? t.experience.fields.institution : 
                 formData.experience_type === 'project' ? t.experience.fields.projectName : 
                 formData.experience_type === 'award' ? t.experience.fields.awardName : 
                 t.experience.fields.company} *
              </Label>
              <Input
                id="company_name"
                placeholder={language === 'pt' ? "Ex: PocketCV, Universidade do Porto, Prêmio Jovem Empreendedor" : "Ex: PocketCV, University of Porto, Young Entrepreneur Award"}
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                {formData.experience_type === 'education' ? t.experience.fields.degree : 
                 formData.experience_type === 'project' ? t.experience.fields.projectRole : 
                 formData.experience_type === 'award' ? t.experience.fields.category : 
                 t.experience.fields.role} *
              </Label>
              <Input
                id="role"
                placeholder={language === 'pt' ? "Ex: Founder, Mestrado em Engenharia, Desenvolvedor Frontend" : "Ex: Founder, Master in Engineering, Frontend Developer"}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.experience.fields.startDate}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date 
                        ? format(new Date(formData.start_date), 'MMM yyyy', { locale: dateLocale })
                        : (language === 'pt' ? 'Selecionar data' : 'Select date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.start_date ? new Date(formData.start_date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({ ...formData, start_date: format(date, 'yyyy-MM-dd') });
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{t.experience.fields.endDate}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={formData.is_current}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date 
                        ? format(new Date(formData.end_date), 'MMM yyyy', { locale: dateLocale })
                        : (language === 'pt' ? 'Selecionar data' : 'Select date')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.end_date ? new Date(formData.end_date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setFormData({ ...formData, end_date: format(date, 'yyyy-MM-dd') });
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_current"
                checked={formData.is_current}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_current: checked as boolean, end_date: '' })
                }
              />
              <Label htmlFor="is_current" className="font-normal cursor-pointer">
                {t.experience.fields.currentPosition}
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.experience.fields.description}</Label>
              <Textarea
                id="description"
                placeholder={t.experience.fields.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.experience.actions.cancel}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.company_name || !formData.role}
            >
              {editingExperience ? t.experience.actions.update : t.experience.actions.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExperienceCard;
