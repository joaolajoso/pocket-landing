
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface LayoutSelectorProps {
  font: string;
  setFont: (font: string) => void;
  buttonStyle: "rounded" | "square";
  setButtonStyle: (style: "rounded" | "square") => void;
  saving: boolean;
  onSave: () => void;
}

const LayoutSelector = ({ 
  font, 
  setFont, 
  buttonStyle, 
  setButtonStyle,
  saving,
  onSave
}: LayoutSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Font</Label>
            <select 
              className="w-full mt-2 p-2 border rounded-md"
              value={font}
              onChange={(e) => setFont(e.target.value)}
            >
              <option value="inter">Inter (Default)</option>
              <option value="roboto">Roboto</option>
              <option value="poppins">Poppins</option>
              <option value="opensans">Open Sans</option>
            </select>
          </div>
          
          <div>
            <Label>Button Style</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div 
                className={`border rounded-md p-2 cursor-pointer ${buttonStyle === "rounded" ? "border-primary" : "hover:border-primary"}`}
                onClick={() => setButtonStyle("rounded")}
              >
                <div className="h-8 border rounded-md mb-1"></div>
                <p className="text-xs font-medium text-center">Rounded</p>
              </div>
              <div 
                className={`border rounded-md p-2 cursor-pointer ${buttonStyle === "square" ? "border-primary" : "hover:border-primary"}`}
                onClick={() => setButtonStyle("square")}
              >
                <div className="h-8 border rounded-sm mb-1"></div>
                <p className="text-xs font-medium text-center">Square</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LayoutSelector;
