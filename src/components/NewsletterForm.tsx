import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { isPortuguese } from '@/utils/languageHelpers';

const NewsletterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: isPortuguese(language) ? 'Erro' : 'Error',
        description: isPortuguese(language) 
          ? 'Por favor, preencha todos os campos'
          : 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: isPortuguese(language) ? 'Erro' : 'Error',
        description: isPortuguese(language) 
          ? 'Por favor, aceite os termos e condições'
          : 'Please accept the terms and conditions',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert([
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: isPortuguese(language) ? 'Email já registado' : 'Email already registered',
            description: isPortuguese(language) 
              ? 'Este email já está subscrito na nossa newsletter'
              : 'This email is already subscribed to our newsletter',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: isPortuguese(language) ? 'Sucesso!' : 'Success!',
          description: isPortuguese(language) 
            ? 'Subscreveu a nossa newsletter com sucesso!'
            : 'Successfully subscribed to our newsletter!',
        });
        
        // Reset form
        setName('');
        setEmail('');
        setAcceptedTerms(false);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: isPortuguese(language) ? 'Erro' : 'Error',
        description: isPortuguese(language) 
          ? 'Erro ao subscrever a newsletter. Tente novamente.'
          : 'Error subscribing to newsletter. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-4">
      <div className="space-y-3">
        <Input
          type="text"
          placeholder={isPortuguese(language) ? 'Seu nome' : 'Your name'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full"
        />
        
        <Input
          type="email"
          placeholder={isPortuguese(language) ? 'Seu email' : 'Your email'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
            {isPortuguese(language) ? (
              <>
                Aceito receber informações e atualizações perante os nossos{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  termos e condições
                </Link>
              </>
            ) : (
              <>
                I accept to receive information and updates according to our{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  terms and conditions
                </Link>
              </>
            )}
          </label>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-[#8c52ff] to-[#ff5757] text-white font-semibold py-3 px-8 rounded-lg hover:from-[#7c47ea] hover:to-[#ef4444] transition-colors"
      >
        {isLoading 
          ? (isPortuguese(language) ? 'Subscrevendo...' : 'Subscribing...')
          : (isPortuguese(language) ? 'Subscrever Newsletter' : 'Subscribe Newsletter')
        }
      </Button>
    </form>
  );
};

export default NewsletterForm;