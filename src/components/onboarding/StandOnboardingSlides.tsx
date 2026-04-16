import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Link2, FileText, BarChart3, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StandOnboardingSlidesProps {
  eventName: string;
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: 'Bem-vindo ao PocketCV',
    getDescription: (eventName: string) =>
      `A sua empresa foi convidada para ${eventName}. Descubra como o PocketCV vai potenciar a sua presença.`,
    gradient: 'from-purple-600 to-pink-500',
  },
  {
    icon: Users,
    title: 'Captura de Leads',
    getDescription: () =>
      'Receba CVs e contactos de visitantes diretamente no seu dashboard, mesmo de quem não tem conta no PocketCV.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Link2,
    title: 'Links e Redes Sociais',
    getDescription: () =>
      'Partilhe o seu site, LinkedIn, Instagram e todas as suas redes num único perfil digital.',
    gradient: 'from-rose-500 to-orange-500',
  },
  {
    icon: FileText,
    title: 'Upload de Documentos',
    getDescription: () =>
      'Disponibilize brochuras, catálogos ou qualquer ficheiro para download na sua página pública.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    getDescription: () =>
      'Acompanhe quem visualizou o seu perfil, clicou nos seus links e gerou conexões — tudo em tempo real.',
    gradient: 'from-amber-500 to-purple-600',
  },
];

const StandOnboardingSlides = ({ eventName, onComplete }: StandOnboardingSlidesProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];
  const Icon = slide.icon;

  const goNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br ${slide.gradient} transition-all duration-700`}>
      {/* Back button */}
      {currentSlide > 0 && (
        <button
          onClick={goBack}
          className="fixed top-6 left-6 text-white/80 hover:text-white flex items-center gap-1 z-20"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="text-sm">Voltar</span>
        </button>
      )}

      {/* Logo */}
      <div className="fixed top-6 right-6 z-20">
        <span className="text-white font-bold text-lg tracking-tight">PocketCV</span>
      </div>

      {/* Slide content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex flex-col items-center text-center max-w-sm mx-auto"
        >
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <Icon className="h-10 w-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
            {slide.title}
          </h2>

          <p className="text-white/90 text-base leading-relaxed mb-12">
            {slide.getDescription(eventName)}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <Button
        onClick={goNext}
        size="lg"
        className="w-full max-w-sm bg-white text-purple-700 hover:bg-white/90 font-semibold text-base gap-2 shadow-xl"
      >
        {isLastSlide ? 'Criar Conta Business' : 'Próximo'}
        <ArrowRight className="h-5 w-5" />
      </Button>

      {isLastSlide && (
        <p className="text-white/60 text-xs mt-4 max-w-xs text-center">
          Ao criar a conta, a sua empresa será automaticamente adicionada ao evento.
        </p>
      )}
    </div>
  );
};

export default StandOnboardingSlides;
