
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ThemeSelectorProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const ThemeSelector = ({ theme, setTheme }: ThemeSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div 
            className={`border rounded-md p-2 cursor-pointer ${theme === "light" ? "border-primary" : "hover:border-primary"}`}
            onClick={() => setTheme("light")}
          >
            <div className="h-12 bg-white rounded mb-2"></div>
            <p className="text-xs font-medium text-center">Light</p>
          </div>
          <div 
            className={`border rounded-md p-2 cursor-pointer ${theme === "dark" ? "border-primary" : "hover:border-primary"}`}
            onClick={() => setTheme("dark")}
          >
            <div className="h-12 bg-zinc-900 rounded mb-2"></div>
            <p className="text-xs font-medium text-center">Dark</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSelector;
