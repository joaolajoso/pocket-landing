
import { createContext, useContext } from "react";
import { DashboardContextType, DashboardProviderProps } from "./types";
import { useDashboardState } from "./hooks/useDashboardState";

// Create the context with a default value
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Provider component
export function DashboardProvider({ children }: DashboardProviderProps) {
  // Use our consolidated dashboard state hook
  const dashboardState = useDashboardState();
  
  return (
    <DashboardContext.Provider value={dashboardState}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
