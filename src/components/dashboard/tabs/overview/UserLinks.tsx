import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  Video, 
  Music, 
  Link as LinkIcon, 
  Calendar,
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation, dashboardTranslations } from "@/translations";
import { useCustomLinks, CustomLink } from "@/hooks/useCustomLinks";

const iconOptions = [
  { name: "filetext", Icon: FileText, color: "bg-purple-500" },
  { name: "video", Icon: Video, color: "bg-red-500" },
  { name: "music", Icon: Music, color: "bg-green-500" },
  { name: "link", Icon: LinkIcon, color: "bg-pink-500" },
  { name: "calendar", Icon: Calendar, color: "bg-blue-500" },
  { name: "shoppingbag", Icon: ShoppingBag, color: "bg-orange-500" },
  { name: "mail", Icon: Mail, color: "bg-indigo-500" },
  { name: "phone", Icon: Phone, color: "bg-teal-500" },
  { name: "mappin", Icon: MapPin, color: "bg-cyan-500" },
  { name: "globe", Icon: Globe, color: "bg-violet-500" },
  { name: "briefcase", Icon: Briefcase, color: "bg-slate-500" },
  { name: "graduationcap", Icon: GraduationCap, color: "bg-amber-500" },
  { name: "heart", Icon: Heart, color: "bg-rose-500" },
  { name: "star", Icon: Star, color: "bg-yellow-500" },
  { name: "sparkles", Icon: Sparkles, color: "bg-fuchsia-500" },
];

const UserLinks = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = getTranslation(language, dashboardTranslations);
  const { customLinks, loading, saveCustomLink, deleteCustomLink } = useCustomLinks();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    icon: "link",
    color: "bg-pink-500"
  });

  const handleOpenDialog = (link?: CustomLink) => {
    if (link) {
      setEditingLink(link);
      const iconOption = iconOptions.find(opt => opt.name === link.icon.toLowerCase());
      setFormData({
        title: link.title,
        url: link.url,
        icon: link.icon.toLowerCase(),
        color: iconOption?.color || "bg-pink-500"
      });
    } else {
      setEditingLink(null);
      setFormData({
        title: "",
        url: "",
        icon: "link",
        color: "bg-pink-500"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveLink = async () => {
    if (!formData.title || !formData.url) {
      toast({
        title: t.customLinks.requiredFields,
        description: t.customLinks.fillTitleUrl,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    const result = await saveCustomLink({
      id: editingLink?.id,
      title: formData.title,
      url: formData.url,
      icon: formData.icon
    });

    setIsSaving(false);

    if (result) {
      toast({
        title: editingLink ? t.customLinks.linkUpdated : t.customLinks.linkAdded,
        description: editingLink ? t.customLinks.linkUpdatedDesc : t.customLinks.linkAddedDesc
      });
      setIsDialogOpen(false);
      setEditingLink(null);
      setFormData({
        title: "",
        url: "",
        icon: "link",
        color: "bg-pink-500"
      });
    }
  };

  const handleDeleteLink = async (id: string) => {
    const success = await deleteCustomLink(id);
    if (success) {
      toast({
        title: t.customLinks.linkRemoved,
        description: t.customLinks.linkRemovedDesc
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName.toLowerCase());
    return iconOption ? iconOption.Icon : LinkIcon;
  };

  const getIconColor = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.name === iconName.toLowerCase());
    return iconOption?.color || "bg-pink-500";
  };

  if (loading) {
    return (
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 md:mb-6">
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between">
          <span>{t.customLinks.title}</span>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                onClick={() => handleOpenDialog()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t.customLinks.addLink}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingLink ? t.customLinks.editLink : t.customLinks.addLink}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t.customLinks.fields.title}</Label>
                  <Input
                    id="title"
                    placeholder={t.customLinks.fields.titlePlaceholder}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">{t.customLinks.fields.url}</Label>
                  <Input
                    id="url"
                    placeholder={t.customLinks.fields.urlPlaceholder}
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.customLinks.fields.chooseIcon}</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((option) => {
                      const IconComponent = option.Icon;
                      const isSelected = formData.icon === option.name;
                      return (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            icon: option.name,
                            color: option.color 
                          })}
                          className={`
                            ${option.color} 
                            p-3 rounded-xl transition-all
                            ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'}
                          `}
                        >
                          <IconComponent className="h-5 w-5 text-white" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button onClick={handleSaveLink} className="w-full" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingLink ? t.customLinks.actions.update : t.customLinks.actions.add}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div>
        {customLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <LinkIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>{t.customLinks.empty}</p>
            <p className="text-sm">{t.customLinks.emptySubtitle}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customLinks.map((link) => {
              const IconComponent = getIconComponent(link.icon);
              const iconColor = getIconColor(link.icon);
              return (
                <div
                  key={link.id}
                  className="group flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`${iconColor} p-2.5 rounded-xl shrink-0`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{link.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(link)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLink(link.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserLinks;
