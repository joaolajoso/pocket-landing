
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface LayoutSelectorProps {
  font: string;
  setFont: (font: string) => void;
  buttonStyle: "rounded" | "square";
  setButtonStyle: (style: "rounded" | "square") => void;
  saving: boolean;
  onSave: (() => void) | null; // Make the onSave prop optional
}

// Array of font options with proper CSS font families
const fontOptions = [
  { name: "Inter", value: "inter", fontFamily: "'Inter', sans-serif" },
  { name: "Roboto", value: "roboto", fontFamily: "'Roboto', sans-serif" },
  { name: "Poppins", value: "poppins", fontFamily: "'Poppins', sans-serif" },
  { name: "Open Sans", value: "opensans", fontFamily: "'Open Sans', sans-serif" },
];

const LayoutSelector = ({ 
  font, 
  setFont, 
  buttonStyle, 
  setButtonStyle,
  saving,
  onSave
}: LayoutSelectorProps) => {
  // Function to load font stylesheets
  const loadFont = (fontValue: string) => {
    // Remove existing fonts first
    document.querySelectorAll('link[data-pocketcv-font]').forEach(link => {
      link.remove();
    });
    
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.setAttribute('data-pocketcv-font', 'true');
    
    if (fontValue === 'roboto') {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap';
    } else if (fontValue === 'poppins') {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700&display=swap';
    } else if (fontValue === 'opensans') {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;700&display=swap';
    } else if (fontValue === 'inter') {
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap';
    }
    
    if (fontLink.href) {
      document.head.appendChild(fontLink);
    }
  };

  // Load the current font on component mount
  useEffect(() => {
    loadFont(font);
  }, [font]);

  const handleFontChange = (newFont: string) => {
    setFont(newFont);
    loadFont(newFont);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Font</Label>
            <RadioGroup
              value={font}
              onValueChange={handleFontChange}
              className="grid grid-cols-2 gap-2 mt-2"
            >
              {fontOptions.map((fontOption) => (
                <div key={fontOption.value} className="flex items-center">
                  <RadioGroupItem value={fontOption.value} id={`font-${fontOption.value}`} className="sr-only" />
                  <Label
                    htmlFor={`font-${fontOption.value}`}
                    className={`flex-1 cursor-pointer rounded-md border p-2 text-center ${
                      font === fontOption.value ? "border-primary bg-primary/10" : "hover:bg-accent"
                    }`}
                    style={{ fontFamily: fontOption.fontFamily }}
                  >
                    {fontOption.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label>Button Style</Label>
            <RadioGroup
              value={buttonStyle}
              onValueChange={setButtonStyle}
              className="grid grid-cols-2 gap-2 mt-2"
            >
              <div className="flex items-center">
                <RadioGroupItem value="rounded" id="button-rounded" className="sr-only" />
                <Label
                  htmlFor="button-rounded"
                  className={`flex-1 cursor-pointer rounded-md border p-2 text-center ${
                    buttonStyle === "rounded" ? "border-primary bg-primary/10" : "hover:bg-accent"
                  }`}
                >
                  Rounded
                </Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="square" id="button-square" className="sr-only" />
                <Label
                  htmlFor="button-square"
                  className={`flex-1 cursor-pointer rounded-md border p-2 text-center ${
                    buttonStyle === "square" ? "border-primary bg-primary/10" : "hover:bg-accent"
                  }`}
                >
                  Square
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {onSave && (
            <Button
              onClick={onSave}
              disabled={saving}
              className="w-full mt-4"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Layout"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LayoutSelector;
