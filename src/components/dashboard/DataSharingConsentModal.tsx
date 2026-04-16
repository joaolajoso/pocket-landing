import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataSharingConsentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (consents: { shareEmail: boolean; sharePhone: boolean }) => void;
  hasEmail: boolean;
  hasPhone: boolean;
  emailValue?: string;
  phoneValue?: string;
}

export const DataSharingConsentModal = ({
  open,
  onClose,
  onConfirm,
  hasEmail,
  hasPhone,
  emailValue,
  phoneValue,
}: DataSharingConsentModalProps) => {
  const [shareEmail, setShareEmail] = useState(false);
  const [sharePhone, setSharePhone] = useState(false);

  const handleConfirm = () => {
    onConfirm({ shareEmail, sharePhone });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Controlo de Privacidade
          </DialogTitle>
          <DialogDescription>
            Está prestes a adicionar dados de contacto ao seu perfil. Por favor, indique que
            informações deseja partilhar publicamente.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            A PocketCV é uma plataforma de networking. Os dados que escolher partilhar estarão
            visíveis publicamente no seu perfil para facilitar conexões profissionais.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 py-4">
          {hasEmail && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="share-email"
                checked={shareEmail}
                onCheckedChange={(checked) => setShareEmail(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="share-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Quero partilhar o meu email publicamente
                </Label>
                {emailValue && (
                  <p className="text-sm text-muted-foreground">
                    Email: <span className="font-medium">{emailValue}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {hasPhone && (
            <div className="flex items-start space-x-3">
              <Checkbox
                id="share-phone"
                checked={sharePhone}
                onCheckedChange={(checked) => setSharePhone(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="share-phone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Quero partilhar o meu número de telefone publicamente
                </Label>
                {phoneValue && (
                  <p className="text-sm text-muted-foreground">
                    Telefone: <span className="font-medium">{phoneValue}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar e Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
