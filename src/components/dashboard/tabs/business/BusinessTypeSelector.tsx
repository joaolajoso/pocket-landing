import { motion } from 'framer-motion';
import { ShoppingBag, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessTypeSelectorProps {
  value: 'products' | 'services';
  onChange: (type: 'products' | 'services') => void;
}

export const BusinessTypeSelector = ({ value, onChange }: BusinessTypeSelectorProps) => {
  const options = [
    {
      type: 'products' as const,
      icon: ShoppingBag,
      title: 'Produtos',
      description: 'Lojas, mercearias, retalho',
      examples: 'Catálogo de produtos com preços',
    },
    {
      type: 'services' as const,
      icon: Briefcase,
      title: 'Serviços',
      description: 'Hotéis, consultoras, agências',
      examples: 'Lista de serviços e comodidades',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option) => {
        const isSelected = value === option.type;
        const Icon = option.icon;

        return (
          <motion.button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            className={cn(
              'relative p-6 rounded-xl border-2 text-left transition-all',
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
            )}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected && (
              <motion.div
                layoutId="business-type-indicator"
                className="absolute inset-0 border-2 border-primary rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            
            <div className="relative z-10">
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="h-6 w-6" />
              </div>
              
              <h3 className={cn(
                'font-semibold text-lg mb-1',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {option.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-2">
                {option.description}
              </p>
              
              <p className="text-xs text-muted-foreground/70">
                {option.examples}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
