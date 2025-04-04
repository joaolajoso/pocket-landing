
import { ReactNode } from "react";

interface DeviceFrameProps {
  children: ReactNode;
  isFrameVisible: boolean;
  deviceType: string;
}

const DeviceFrame = ({ children, isFrameVisible, deviceType }: DeviceFrameProps) => {
  if (deviceType === "desktop") {
    return (
      <div 
        className={`mx-auto ${
          isFrameVisible 
            ? "max-w-3xl bg-white/40 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg" 
            : "max-w-md"
        }`}
      >
        {isFrameVisible && (
          <div className="flex items-center justify-start gap-2 mb-4 px-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-auto max-w-xs">
              <div className="h-6 bg-muted/30 rounded-full w-full" />
            </div>
          </div>
        )}
        
        <div 
          className={`bg-background rounded-lg ${
            isFrameVisible ? "border border-border" : ""
          } overflow-hidden p-6`}
        >
          {children}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`mx-auto ${
        isFrameVisible 
          ? "max-w-xs bg-white/40 backdrop-blur-sm border-4 border-gray-800 rounded-[2.5rem] p-2 shadow-xl" 
          : "max-w-xs"
      }`}
    >
      {isFrameVisible && (
        <div className="flex justify-center w-full mb-2">
          <div className="w-24 h-6 bg-black rounded-full" />
        </div>
      )}
      
      <div 
        className={`bg-background rounded-2xl ${
          isFrameVisible ? "border border-gray-300" : ""
        } overflow-hidden`}
        style={{ 
          height: isFrameVisible ? "70vh" : "auto",
          overflowY: "auto"
        }}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
      
      {isFrameVisible && (
        <div className="flex justify-center w-full mt-4">
          <div className="w-32 h-1 bg-black rounded-full" />
        </div>
      )}
    </div>
  );
};

export default DeviceFrame;
