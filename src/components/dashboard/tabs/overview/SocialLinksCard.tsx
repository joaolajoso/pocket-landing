import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Linkedin, Github, Instagram, Twitter, Facebook, Youtube, Plus, ExternalLink, Trash2, Pencil, MessageCircle, Send } from "lucide-react";

// TikTok custom icon (Lucide doesn't have native TikTok)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SocialShortcuts } from "@/components/ui/SocialShortcuts";
import { getTranslation, dashboardTranslations } from "@/translations";
import { useSocialLinks, SocialLink } from "@/hooks/useSocialLinks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const socialPlatforms = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-primary", bgColor: "bg-primary/10", hoverColor: "hover:bg-primary/20", placeholder: "linkedin.com/in/o-teu-perfil" },
  { id: "github", label: "GitHub", icon: Github, color: "text-foreground", bgColor: "bg-muted", hoverColor: "hover:bg-muted/80", placeholder: "github.com/o-teu-username" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-[#E4405F]", bgColor: "bg-[#E4405F]/10", hoverColor: "hover:bg-[#E4405F]/20", placeholder: "instagram.com/o-teu-perfil" },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "text-foreground", bgColor: "bg-muted", hoverColor: "hover:bg-muted/80", placeholder: "x.com/o-teu-perfil" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-[#1877F2]", bgColor: "bg-[#1877F2]/10", hoverColor: "hover:bg-[#1877F2]/20", placeholder: "facebook.com/o-teu-perfil" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "text-[#FF0000]", bgColor: "bg-[#FF0000]/10", hoverColor: "hover:bg-[#FF0000]/20", placeholder: "youtube.com/@o-teu-canal" },
  { id: "tiktok", label: "TikTok", icon: TikTokIcon, color: "text-foreground", bgColor: "bg-muted", hoverColor: "hover:bg-muted/80", placeholder: "tiktok.com/@o-teu-perfil" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]", bgColor: "bg-[#25D366]/10", hoverColor: "hover:bg-[#25D366]/20", placeholder: "351912345678 (apenas números)", isPhone: true },
  { id: "telegram", label: "Telegram", icon: Send, color: "text-[#0088cc]", bgColor: "bg-[#0088cc]/10", hoverColor: "hover:bg-[#0088cc]/20", placeholder: "t.me/o-teu-username" },
];

const getIconComponent = (iconId: string) => {
  const platform = socialPlatforms.find(p => p.id === iconId);
  return platform?.icon || Linkedin;
};

const getPlatformConfig = (iconId: string) => {
  return socialPlatforms.find(p => p.id === iconId) || socialPlatforms[0];
};

const SocialLinksCard = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const { socialLinks, loading, saveSocialLink, deleteSocialLink } = useSocialLinks();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({ title: "", url: "", icon: "linkedin" });

  const handleOpenDialog = (link?: SocialLink) => {
    if (link) {
      setEditingLink(link);
      // Extract phone number from WhatsApp URL for editing
      let urlValue = link.url;
      if (link.icon === "whatsapp" && link.url.includes("wa.me/")) {
        urlValue = link.url.replace("https://wa.me/", "").replace("http://wa.me/", "");
      }
      setFormData({ title: link.title, url: urlValue, icon: link.icon });
    } else {
      setEditingLink(null);
      setFormData({ title: "", url: "", icon: "linkedin" });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.url) {
      toast({
        title: t.socialLinks.emptyLink,
        description: t.socialLinks.enterValidLink,
        variant: "destructive",
      });
      return;
    }

    const platform = getPlatformConfig(formData.icon);
    const title = formData.title || platform.label;

    // Format URL for WhatsApp
    let urlToSave = formData.url;
    if (formData.icon === "whatsapp") {
      const cleanPhone = formData.url.replace(/\D/g, '');
      urlToSave = `https://wa.me/${cleanPhone}`;
    } else if (!formData.url.startsWith("http")) {
      urlToSave = `https://${formData.url}`;
    }

    const result = await saveSocialLink({
      id: editingLink?.id,
      title,
      url: urlToSave,
      icon: formData.icon,
    });

    if (result) {
      setDialogOpen(false);
      setEditingLink(null);
      setFormData({ title: "", url: "", icon: "linkedin" });
    }
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;

    const result = await deleteSocialLink(linkToDelete.id);
    if (result) {
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
    }
  };

  const handleTestLink = () => {
    if (!formData.url) {
      toast({
        title: t.socialLinks.emptyLink,
        description: t.socialLinks.enterValidLink,
        variant: "destructive",
      });
      return;
    }
    
    // Handle WhatsApp - format phone number to wa.me link
    if (formData.icon === "whatsapp") {
      const cleanPhone = formData.url.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
      return;
    }
    
    const url = formData.url.startsWith("http") ? formData.url : `https://${formData.url}`;
    window.open(url, "_blank");
  };

  const openDeleteDialog = (link: SocialLink, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinkToDelete(link);
    setDeleteDialogOpen(true);
  };

  const openEditDialog = (link: SocialLink, e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenDialog(link);
  };

  if (loading) {
    return (
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 px-1">{t.socialLinks.title}</h3>
        <div className="flex items-center justify-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 px-1">{t.socialLinks.title}</h3>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {socialLinks.map((link) => {
            const config = getPlatformConfig(link.icon);
            const Icon = getIconComponent(link.icon);

            return (
              <div key={link.id} className="relative group">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleOpenDialog(link)}
                  className={`${config.bgColor} ${config.hoverColor} border-0 h-24 md:h-32 w-full p-0 relative rounded-2xl`}
                >
                  <Icon className={`h-12 w-12 md:h-16 md:w-16 ${config.color}`} />
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                </Button>
                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    onClick={(e) => openEditDialog(link, e)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-7 w-7"
                    onClick={(e) => openDeleteDialog(link, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            size="lg"
            onClick={() => handleOpenDialog()}
            className="border-dashed border border-white/20 h-24 md:h-32 w-full p-0 rounded-2xl hover:bg-white/10 bg-transparent"
          >
            <Plus className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(() => {
                const config = getPlatformConfig(formData.icon);
                const Icon = getIconComponent(formData.icon);
                return (
                  <>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    {editingLink ? "Edit" : "Add"} Social Network
                  </>
                );
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData((prev) => ({ ...prev, icon: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${platform.color}`} />
                          {platform.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-title">{t.socialLinks.linkName}</Label>
              <Input
                id="link-title"
                placeholder={t.socialLinks.linkNamePlaceholder}
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">
                {formData.icon === "whatsapp" ? "Número de telefone" : t.socialLinks.linkUrl}
              </Label>
              <Input
                id="link-url"
                placeholder={getPlatformConfig(formData.icon)?.placeholder || t.socialLinks.linkUrlPlaceholder}
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              />
              {formData.icon !== "whatsapp" && (
                <SocialShortcuts selectedPlatform={formData.icon} variant="compact" />
              )}
              {formData.icon === "whatsapp" && (
                <p className="text-xs text-muted-foreground">
                  Exemplo: 351912345678 (código do país + número)
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleTestLink} disabled={!formData.url}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {t.socialLinks.testLink}
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                {t.socialLinks.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Social Network</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this social network link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SocialLinksCard;
