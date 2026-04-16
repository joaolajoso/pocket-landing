import React from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocalizedText } from "@/utils/languageHelpers";
const ComparisonTable = () => {
  const {
    language
  } = useLanguage();
  const features = [{
    name: getLocalizedText(language, 'Custo', 'Cost'),
    traditional: getLocalizedText(language, '€4,99 por 100 cartões', '€4.99 per 100 cards'),
    pocketcv: getLocalizedText(language, '€5 (pagamento único)', '€5 (one-time)'),
    icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
  }, {
    name: getLocalizedText(language, 'Longevidade', 'Longevity'),
    traditional: getLocalizedText(language, 'Esgota, precisa de reabastecimento', 'Runs out, needs reordering'),
    pocketcv: getLocalizedText(language, 'Permanente, reutilizável', 'Permanent, reusable'),
    icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
  }, {
    name: getLocalizedText(language, 'Conveniência', 'Convenience'),
    traditional: getLocalizedText(language, 'Volumoso, fácil de perder', 'Bulky, easy to lose'),
    pocketcv: getLocalizedText(language, 'Sempre acessível', 'Always accessible'),
    icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
  }, {
    name: getLocalizedText(language, 'Atualizações', 'Updates'),
    traditional: getLocalizedText(language, 'Requer reimpressão para alterações', 'Need reprints for changes'),
    pocketcv: getLocalizedText(language, 'Atualizável instantaneamente', 'Instantly updateable'),
    icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
  }, {
    name: getLocalizedText(language, 'Ecológico', 'Eco-Friendly'),
    traditional: getLocalizedText(language, 'Desperdício de papel', 'Paper waste'),
    pocketcv: getLocalizedText(language, 'Alternativa digital sustentável', 'Sustainable, digital alternative'),
    icon: <ArrowRight className="h-4 w-4 text-pocketcv-orange" />
  }];
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">{getLocalizedText(language, 'Característica', 'Feature')}</TableHead>
            <TableHead className="w-1/3">{getLocalizedText(language, 'Cartões Tradicionais', 'Traditional Cards')}</TableHead>
            <TableHead className="w-1/3">PocketCV</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{feature.name}</TableCell>
              <TableCell className="text-muted-foreground">{feature.traditional}</TableCell>
              <TableCell className="text-green-600 font-medium flex items-center gap-2">
                {feature.pocketcv}
                {feature.icon}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default ComparisonTable;