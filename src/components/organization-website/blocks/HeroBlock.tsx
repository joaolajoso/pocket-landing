import { ReactNode } from 'react';

export interface HeroBlockProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  children?: ReactNode;
}

export const HeroBlock = ({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundColor = '#0ea5e9',
  textColor = '#ffffff',
  ctaButton,
  children
}: HeroBlockProps) => {
  return (
    <section 
      className="relative min-h-[400px] flex items-center justify-center py-20 px-6"
      style={{
        backgroundColor: !backgroundImage ? backgroundColor : undefined,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: textColor
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {subtitle && (
          <p className="text-sm uppercase tracking-wider mb-4 opacity-90">
            {subtitle}
          </p>
        )}
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {title}
        </h1>
        
        {description && (
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {description}
          </p>
        )}
        
        {ctaButton && (
          <a
            href={ctaButton.url}
            className="inline-block px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {ctaButton.text}
          </a>
        )}
        
        {children}
      </div>
    </section>
  );
};
