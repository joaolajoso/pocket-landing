import React, { useState, Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Sparkles, Rocket, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ThreeLavaLamp = lazy(() => import("@/components/ui/ThreeLavaLamp").then(m => ({ default: m.default })));

interface EarlyAdopterSectionProps {
  isPt: boolean;
}

const EarlyAdopterSection: React.FC<EarlyAdopterSectionProps> = ({ isPt }) => {
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: isPt ? "Email obrigatório" : "Email required",
        description: isPt ? "Por favor, insira o seu email." : "Please enter your email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert({
          email,
          name: experience || "Early Adopter",
          status: "early_adopter"
        });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: isPt ? "Email já registado" : "Email already registered",
            description: isPt ? "Este email já está na nossa lista." : "This email is already on our list.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: isPt ? "Bem-vindo à revolução!" : "Welcome to the revolution!",
          description: isPt 
            ? "Obrigado por se juntar aos Early Adopters!" 
            : "Thank you for joining the Early Adopters!",
        });
        setEmail("");
        setExperience("");
      }
    } catch (error) {
      toast({
        title: isPt ? "Erro" : "Error",
        description: isPt ? "Algo correu mal. Tente novamente." : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Lava Lamp Background */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900" />}>
          <ThreeLavaLamp colors={["#7c3aed", "#581c87", "#ea580c", "#dc2626"]} />
        </Suspense>
      </div>
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Rocket className="h-12 w-12 text-white animate-bounce" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isPt ? "Torna-te um Early Adopter" : "Become an Early Adopter"}
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            {isPt 
              ? "Ajuda a impulsionar a revolução do networking, obtém acesso antecipado à nossa plataforma e destaca-te da multidão!" 
              : "Help jumpstart the networking revolution, gain early access to our platform, stand out from the crowd!"}
          </p>

          {/* Benefits */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <Gift className="h-5 w-5" />
              {isPt ? "Ofertas Exclusivas:" : "Exclusive Offers:"}
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-1 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-white">
                  {isPt 
                    ? "Acesso gratuito a todas as funcionalidades SOLO e EXPOSITORES E EQUIPAS!" 
                    : "Free access to all SOLO and EXHIBITORS AND TEAMS features!"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-500 rounded-full p-1 mt-0.5">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-white">
                  {isPt 
                    ? "3 meses de acesso gratuito às funcionalidades ORGANIZADORES." 
                    : "3-month free access to ORGANIZERS features."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
          <div>
            <Textarea
              placeholder={isPt 
                ? "Partilha as tuas experiências e desafios de networking..." 
                : "Share your networking experiences and challenges..."}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px] resize-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder={isPt ? "O teu email" : "Your email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              required
            />
            <Button 
              type="submit" 
              size="lg"
              disabled={isLoading}
              className="bg-white text-pocketcv-purple hover:bg-white/90 font-semibold whitespace-nowrap"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoading 
                ? (isPt ? "A enviar..." : "Sending...") 
                : (isPt ? "Inscrever-me Agora" : "Sign Up Now")}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EarlyAdopterSection;
