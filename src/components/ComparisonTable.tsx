
import React from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";

const ComparisonTable = () => {
  const { language } = useLanguage();

  const features = [
    {
      name: language === 'en' ? 'Cost' : 'Custo',
      traditional: language === 'en' ? '€4.99 per 100 cards' : '€4,99 por 100 cartões',
      pocketcv: language === 'en' ? '€5 (one-time)' : '€5 (pagamento único)',
      icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
    },
    {
      name: language === 'en' ? 'Longevity' : 'Longevidade',
      traditional: language === 'en' ? 'Runs out, needs reordering' : 'Esgota, precisa de reabastecimento',
      pocketcv: language === 'en' ? 'Permanent, reusable' : 'Permanente, reutilizável',
      icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
    },
    {
      name: language === 'en' ? 'Convenience' : 'Conveniência',
      traditional: language === 'en' ? 'Bulky, easy to lose' : 'Volumoso, fácil de perder',
      pocketcv: language === 'en' ? 'Always accessible' : 'Sempre acessível',
      icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
    },
    {
      name: language === 'en' ? 'Updates' : 'Atualizações',
      traditional: language === 'en' ? 'Need reprints for changes' : 'Requer reimpressão para alterações',
      pocketcv: language === 'en' ? 'Instantly updateable' : 'Atualizável instantaneamente',
      icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
    },
    {
      name: language === 'en' ? 'Eco-Friendly' : 'Ecológico',
      traditional: language === 'en' ? 'Paper waste' : 'Desperdício de papel',
      pocketcv: language === 'en' ? 'Sustainable, digital alternative' : 'Alternativa digital sustentável',
      icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-gradient">
            {language === 'en' ? 'PocketCV vs. Traditional Business Cards' : 'PocketCV vs. Cartões de Visita Tradicionais'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-center">
            {language === 'en' 
              ? 'See how PocketCV compares to traditional business cards in terms of cost, convenience, and sustainability.'
              : 'Veja como o PocketCV se compara aos cartões de visita tradicionais em termos de custo, conveniência e sustentabilidade.'}
          </p>
          
          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[30%] font-medium">{language === 'en' ? 'Feature' : 'Característica'}</TableHead>
                  <TableHead className="w-[35%] font-medium">{language === 'en' ? 'Traditional Business Cards' : 'Cartões de Visita Tradicionais'}</TableHead>
                  <TableHead className="w-[35%] font-medium">{language === 'en' ? 'PocketCV' : 'PocketCV'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-muted/20'}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {feature.icon}
                      {feature.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>{feature.traditional}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium">{feature.pocketcv}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
