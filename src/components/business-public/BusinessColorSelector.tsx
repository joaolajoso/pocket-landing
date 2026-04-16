import { useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { businessColorThemes, darkenHex } from "./businessColorThemes";

interface BusinessColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
}

export const BusinessColorSelector = ({ value, onChange }: BusinessColorSelectorProps) => {
  const [customHex, setCustomHex] = useState(value || "");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const predefinedColors = Object.entries(businessColorThemes);
  
  const isCustomColor = !predefinedColors.some(
    ([_, theme]) => theme.hex.toLowerCase() === value?.toLowerCase()
  );

  const handleColorSelect = (hex: string) => {
    onChange(hex);
    setShowCustomInput(false);
  };

  const handleCustomHexChange = (hex: string) => {
    // Ensure it starts with #
    let cleanHex = hex.replace(/[^0-9a-fA-F#]/g, '');
    if (!cleanHex.startsWith('#')) {
      cleanHex = '#' + cleanHex;
    }
    // Limit to 7 characters (#RRGGBB)
    cleanHex = cleanHex.slice(0, 7);
    setCustomHex(cleanHex);
    
    // Only update if valid hex
    if (/^#[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      onChange(cleanHex);
    }
  };

  const selectedHex = value || businessColorThemes.sky.hex;
  const darkerHex = darkenHex(selectedHex, 15);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Cor Principal</Label>
        <div className="grid grid-cols-4 gap-2">
          {predefinedColors.map(([key, theme]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleColorSelect(theme.hex)}
              className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                value?.toLowerCase() === theme.hex.toLowerCase()
                  ? 'border-white ring-2 ring-offset-2 ring-offset-background ring-primary'
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
              style={{ backgroundColor: theme.hex }}
              title={theme.name}
            >
              {value?.toLowerCase() === theme.hex.toLowerCase() && (
                <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />
              )}
            </button>
          ))}
          
          {/* Custom color button */}
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className={`relative w-full aspect-square rounded-lg border-2 transition-all overflow-hidden ${
              isCustomColor && value
                ? 'border-white ring-2 ring-offset-2 ring-offset-background ring-primary'
                : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
            }`}
            style={isCustomColor && value ? { backgroundColor: value } : undefined}
            title="Cor personalizada"
          >
            {isCustomColor && value ? (
              <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md" />
            ) : (
              <span className="text-xs text-muted-foreground">HEX</span>
            )}
          </button>
        </div>
      </div>

      {/* Custom HEX Input - always visible */}
      <div className="space-y-2">
        <Label htmlFor="custom-hex" className="text-sm">HEX Personalizado</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(customHex) ? customHex : selectedHex}
            onChange={(e) => handleCustomHexChange(e.target.value)}
            className="w-10 h-10 rounded-lg border border-input cursor-pointer bg-transparent p-0.5 shrink-0"
          />
          <Input
            id="custom-hex"
            value={customHex}
            onChange={(e) => handleCustomHexChange(e.target.value)}
            placeholder="#0ea5e9"
            maxLength={7}
            className="font-mono"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label className="text-sm">Pré-visualização do Gradiente</Label>
        <div 
          className="h-16 rounded-lg"
          style={{
            background: `linear-gradient(to bottom, ${selectedHex}, ${darkerHex}, #1A1A1A)`
          }}
        />
      </div>
    </div>
  );
};
