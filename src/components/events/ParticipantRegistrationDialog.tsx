import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export interface RegistrationData {
  academicDegree: string;
  educationAreas: string[];
  opportunityInterests: string[];
}

interface ParticipantRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RegistrationData) => Promise<void>;
  onSkip: () => Promise<void>;
}

const ACADEMIC_DEGREES = [
  "Último ano da licenciatura",
  "Licenciatura",
  "Mestrado",
  "Doutoramento",
  "Outro"
];

const EDUCATION_AREAS = [
  "Marketing",
  "Economia/Gestão/Financeira",
  "Engenharia",
  "Tecnologia",
  "Outra"
];

const OPPORTUNITY_INTERESTS = [
  "Primeiro emprego (licenciado/Mestrado)",
  "Summer Internship",
  "Estágio Curricular/Extracurricular",
  "Programa de Embaixadores"
];

export const ParticipantRegistrationDialog = ({
  open,
  onOpenChange,
  onSubmit,
  onSkip
}: ParticipantRegistrationDialogProps) => {
  const [academicDegree, setAcademicDegree] = useState<string>("");
  const [educationAreas, setEducationAreas] = useState<string[]>([]);
  const [opportunityInterests, setOpportunityInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleEducationArea = (area: string) => {
    setEducationAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const toggleOpportunityInterest = (interest: string) => {
    setOpportunityInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        academicDegree,
        educationAreas,
        opportunityInterests
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await onSkip();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registo para o Evento</DialogTitle>
          <DialogDescription>
            Complete o seu perfil de participante para partilhar com as empresas presentes no evento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Academic Degree */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              1. Qual o seu grau académico atual?
            </Label>
            <RadioGroup value={academicDegree} onValueChange={setAcademicDegree}>
              {ACADEMIC_DEGREES.map((degree) => (
                <div key={degree} className="flex items-center space-x-2">
                  <RadioGroupItem value={degree} id={degree} />
                  <Label htmlFor={degree} className="font-normal cursor-pointer">
                    {degree}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Education Areas */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              2. Qual a sua área de formação?
            </Label>
            <div className="flex flex-wrap gap-2">
              {EDUCATION_AREAS.map((area) => (
                <Badge
                  key={area}
                  variant={educationAreas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => toggleEducationArea(area)}
                >
                  {area}
                  {educationAreas.includes(area) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
            {educationAreas.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selecionado: {educationAreas.join(', ')}
              </p>
            )}
          </div>

          {/* Opportunity Interests */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              3. Para qual destas oportunidades tem interesse?
            </Label>
            <div className="flex flex-wrap gap-2">
              {OPPORTUNITY_INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  variant={opportunityInterests.includes(interest) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => toggleOpportunityInterest(interest)}
                >
                  {interest}
                  {opportunityInterests.includes(interest) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
            {opportunityInterests.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Selecionado: {opportunityInterests.join(', ')}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
