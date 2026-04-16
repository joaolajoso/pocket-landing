import React from "react";
import { Check, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  priceSubtext?: string;
  features: string[];
  badge?: string;
  gradientClass: string;
  buttonText: string;
  buttonLink?: string;
  isExternal?: boolean;
  isPt: boolean;
  isCompact?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  name,
  description,
  price,
  priceSubtext,
  features,
  badge,
  gradientClass,
  buttonText,
  buttonLink,
  isExternal,
  isPt,
  isCompact = false,
}) => {
  return (
    <Card className={cn(
      "flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden",
      gradientClass,
      isCompact && "min-h-[420px]"
    )}>
      <CardHeader className={cn("text-white", isCompact ? "pb-2" : "pb-4")}>
        {badge && (
          <Badge className="w-fit mb-2 bg-white/20 text-white border-white/30 hover:bg-white/30">
            {badge}
          </Badge>
        )}
        <CardTitle className={cn("font-bold", isCompact ? "text-xl" : "text-2xl")}>{name}</CardTitle>
        <CardDescription className={cn("text-white/90 leading-relaxed", isCompact ? "text-xs line-clamp-2" : "text-sm")}>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 text-white">
        <div className={cn(isCompact ? "mb-3" : "mb-6")}>
          <span className={cn("font-bold", isCompact ? "text-3xl" : "text-4xl")}>{price}</span>
          {priceSubtext && (
            <span className="text-white/80 text-sm ml-1">{priceSubtext}</span>
          )}
        </div>
        
        <div className={cn("space-y-2", isCompact && "space-y-1.5")}>
          {(isCompact ? features.slice(0, 4) : features).map((feature, index) => (
            <div key={index} className={cn("flex items-start gap-2", isCompact ? "text-xs" : "text-sm")}>
              <Check className={cn("mt-0.5 flex-shrink-0 text-white", isCompact ? "h-3 w-3" : "h-4 w-4")} />
              <span className="text-white/95">{feature}</span>
            </div>
          ))}
          {isCompact && features.length > 4 && (
            <p className="text-xs text-white/70 pl-5">+{features.length - 4} more...</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 pt-4">
        {buttonLink ? (
          isExternal ? (
            <Button 
              className="w-full bg-white text-gray-800 hover:bg-white/90 font-semibold"
              asChild
            >
              <a href={buttonLink} target="_blank" rel="noopener noreferrer">
                {buttonText}
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          ) : (
            <Button 
              className="w-full bg-white text-gray-800 hover:bg-white/90 font-semibold"
              asChild
            >
              <a href={buttonLink}>{buttonText}</a>
            </Button>
          )
        ) : (
          <Button 
            className="w-full bg-white text-gray-800 hover:bg-white/90 font-semibold"
            disabled
          >
            {buttonText}
          </Button>
        )}
        <p className="text-xs text-white/70 text-center">
          {isPt 
            ? "* Características sujeitas a alteração" 
            : "* Features subject to change"}
        </p>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
