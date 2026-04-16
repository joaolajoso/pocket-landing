
import { useState, useEffect } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, QrCode, Smartphone, InfoIcon, NfcIcon, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TipProps {
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const Tip = ({ icon, title, description }: TipProps) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-primary/10 p-2 rounded-full text-primary">
        {icon}
      </div>
      <h3 className="font-medium text-lg">{title}</h3>
    </div>
    <div className="text-muted-foreground text-sm">
      {description}
    </div>
  </div>
);

const NfcTipsCarousel = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="py-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="tips" className="border-none">
          <div className="flex items-center">
            <InfoIcon className="h-5 w-5 mr-2 text-primary" />
            <AccordionTrigger className="text-lg font-medium hover:no-underline">
              PocketCV Usage Tips
            </AccordionTrigger>
          </div>
          <AccordionContent>
            <div className="flex flex-col lg:flex-row gap-6 mt-4">
              {/* NFC Image */}
              <div className="flex-shrink-0 flex justify-center lg:justify-start">
                <img 
                  src="/lovable-uploads/93e16471-324d-49f4-bd54-e89fae1bc49f.png" 
                  alt="NFC phones illustration" 
                  className="w-48 h-auto object-contain"
                />
              </div>
              
              {/* Tips Carousel */}
              <div className="flex-1 relative px-6">
                <Carousel className="w-full relative overflow-visible">
                  <CarouselContent>
                    <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                      <Card className="border-none shadow-sm bg-card/50">
                        <CardContent className="p-6">
                          <Tip 
                            icon={<Clock className="h-5 w-5" />}
                            title="Patience is Key"
                            description={
                              <div>
                                <p>Wait at least 3 seconds for the card to be read by the device. Hold your card steady against the phone until the connection is established.</p>
                                <p className="mt-2">If it doesn't work immediately, try adjusting the position slightly.</p>
                              </div>
                            }
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    
                    <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                      <Card className="border-none shadow-sm bg-card/50">
                        <CardContent className="p-6">
                          <Tip 
                            icon={<QrCode className="h-5 w-5" />}
                            title="QR Code Alternative"
                            description={
                              <div>
                                <p>Every PocketCV profile has a QR code that can be scanned if the lead's device doesn't have NFC enabled.</p>
                                <p className="mt-2">Share your profile link or let them scan your profile's QR code for instant access.</p>
                              </div>
                            }
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    
                    <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                      <Card className="border-none shadow-sm bg-card/50">
                        <CardContent className="p-6">
                          <Tip 
                            icon={<NfcIcon className="h-5 w-5" />}
                            title="NFC Must Be On"
                            description={
                              <div>
                                <p>Ensure both your card and the recipient's device have NFC enabled. For iPhones, NFC is always on for XR and newer models.</p>
                                <p className="mt-2">Android users may need to enable NFC in their settings.</p>
                              </div>
                            }
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                    
                    <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                      <Card className="border-none shadow-sm bg-card/50">
                        <CardContent className="p-6">
                          <Tip 
                            icon={<Smartphone className="h-5 w-5" />}
                            title="Screen Must Be On"
                            description={
                              <div>
                                <p>The recipient's phone screen must be on and unlocked when tapping your NFC device.</p>
                                <p className="mt-2">No need to open any specific app - just make sure the screen is active.</p>
                              </div>
                            }
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-4 top-1/2 transform -translate-y-1/2 bg-background border shadow-lg z-10" />
                  <CarouselNext className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-background border shadow-lg z-10" />
                </Carousel>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NfcTipsCarousel;
