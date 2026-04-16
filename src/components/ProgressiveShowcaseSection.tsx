import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import {
  SliderBtnGroup,
  ProgressSlider,
  SliderBtn,
  SliderContent,
  SliderWrapper,
} from '@/components/ui/progressive-carousel';
import visitorsImg from '@/assets/visitors.webp';
import exhibitorsImg from '@/assets/exhibitors.webp';
import eventsImg from '@/assets/events.webp';
import { useLanguage } from "@/contexts/LanguageContext";
import { isPortuguese } from "@/utils/languageHelpers";

export default function ProgressiveShowcaseSection() {
  const { language } = useLanguage();
  const isPt = isPortuguese(language);

  const items = [
    {
      img: visitorsImg,
      title: isPt ? 'NETWORKING MAIS INTELIGENTE. INSTANTÂNEO.' : 'NETWORK SMARTER. INSTANTLY.',
      desc: isPt 
        ? 'Conecte-se em movimento. Partilhe o seu currículo, links e perfil instantaneamente enquanto organiza todas as novas conexões.'
        : 'Connect as you go. Share your resume, links, and profile instantly while organizing all new connections.',
      sliderName: 'networkers',
    },
    {
      img: exhibitorsImg,
      title: isPt ? 'ACELERE A CAPTURA DE LEADS.' : 'ACCELERATE LEAD CAPTURE.',
      desc: isPt
        ? 'Capture contactos instantaneamente, automatize follow-ups e sincronize dados diretamente com o seu CRM. Encurte o seu ciclo de vendas eliminando tarefas manuais.'
        : 'Capture contacts instantly, automate follow-ups, and sync data directly to your CRM. Shorten your sales cycle by eliminating manual tasks.',
      sliderName: 'exhibitors',
    },
    {
      img: eventsImg,
      title: isPt ? 'DESBLOQUEIE O ROI DO EVENTO.' : 'UNLOCK EVENT ROI.',
      desc: isPt
        ? 'Obtenha métricas de engagement centralizadas em tempo real. Acompanhe o desempenho dos expositores, meça o momentum pós-evento e impulsione renovações de patrocínios.'
        : 'Gain centralized, real-time engagement metrics. Track exhibitor performance, measure post-event momentum, and drive sponsorship renewals.',
      sliderName: 'organizers',
    },
  ];

  const ctaText = isPt ? 'Começar' : 'Get Started';

  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <ProgressSlider vertical={false} activeSlider='networkers' duration={6000} className="max-w-6xl mx-auto">
          <SliderContent>
            {items.map((item, index) => (
              <SliderWrapper key={index} value={item?.sliderName}>
                <div className="relative rounded-xl overflow-hidden h-[500px] md:h-[600px] mb-4">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src={item.img}
                    alt={item.desc}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end items-start p-8 md:p-12">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                      {item.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                      {item.desc}
                    </p>
                    <Link 
                      to="/get-started"
                      className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors w-fit"
                    >
                      {ctaText}
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </SliderWrapper>
            ))}
          </SliderContent>

          <SliderBtnGroup className='h-fit bg-background/80 backdrop-blur-md overflow-hidden grid grid-cols-3 rounded-md'>
            {items.map((item, index) => (
              <SliderBtn
                key={index}
                value={item?.sliderName}
                className='text-left cursor-pointer p-4 border-r border-border last:border-r-0'
                progressBarClass='bg-orange-600/30 h-full'
              >
                <h3 className='text-sm font-semibold text-foreground'>
                  {item.title}
                </h3>
              </SliderBtn>
            ))}
          </SliderBtnGroup>
        </ProgressSlider>
      </div>
    </section>
  );
}
