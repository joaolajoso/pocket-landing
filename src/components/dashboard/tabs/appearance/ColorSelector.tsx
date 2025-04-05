
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Array of color options
export const colorOptions = [
  { name: "Purple", bg: "bg-purple-500", value: "#8b5cf6" },
  { name: "Blue", bg: "bg-blue-500", value: "#3b82f6" },
  { name: "Green", bg: "bg-green-500", value: "#22c55e" },
  { name: "Yellow", bg: "bg-yellow-500", value: "#eab308" },
  { name: "Red", bg: "bg-red-500", value: "#ef4444" },
];

// Array of background color options
export const bgColorOptions = [
  { name: "Light Purple", bg: "bg-purple-50", value: "#faf5ff" },
  { name: "Light Blue", bg: "bg-blue-50", value: "#eff6ff" },
  { name: "Light Green", bg: "bg-green-50", value: "#f0fdf4" },
  { name: "Light Yellow", bg: "bg-yellow-50", value: "#fefce8" },
  { name: "Light Red", bg: "bg-red-50", value: "#fef2f2" },
];

interface ColorSelectorProps {
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

const ColorSelector = ({ 
  primaryColor, 
  setPrimaryColor, 
  backgroundColor, 
  setBackgroundColor 
}: ColorSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Background Color</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {bgColorOptions.map((color) => (
                <div 
                  key={color.name}
                  className={`h-6 w-6 rounded-full ${color.bg} cursor-pointer relative`}
                  onClick={() => setBackgroundColor(color.value)}
                  style={{ boxShadow: backgroundColor === color.value ? "0 0 0 2px white, 0 0 0 4px currentColor" : "none" }}
                >
                  {backgroundColor === color.value && (
                    <Check className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Button Color</Label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {colorOptions.map((color) => (
                <div 
                  key={color.name}
                  className={`h-6 w-6 rounded-full ${color.bg} cursor-pointer relative`}
                  onClick={() => setPrimaryColor(color.value)}
                  style={{ boxShadow: primaryColor === color.value ? "0 0 0 2px white, 0 0 0 4px currentColor" : "none" }}
                >
                  {primaryColor === color.value && (
                    <Check className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorSelector;
