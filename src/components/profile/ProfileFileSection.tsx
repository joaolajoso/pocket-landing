import { FileText, Download } from "lucide-react";

interface ProfileFileSectionProps {
  fileUrl: string;
  fileName: string;
  theme: {
    accentLight: string;
    textAccent: string;
    accent: string;
  };
}

const ProfileFileSection = ({ fileUrl, fileName, theme }: ProfileFileSectionProps) => {
  const isPdf = fileName?.toLowerCase().endsWith(".pdf");

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-xl bg-[#2A2A2A]/80 hover:bg-[#2A2A2A] transition-colors group"
    >
      {/* Preview thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1A1A1A]/60 flex-shrink-0 border border-white/10">
        {isPdf ? (
          <iframe
            src={`${fileUrl}#page=1&view=FitH`}
            className="w-full h-full pointer-events-none scale-[1.5] origin-top-left"
            title="Preview"
            tabIndex={-1}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className={`w-6 h-6 ${theme.textAccent}`} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{fileName}</p>
        <p className="text-white/50 text-xs">Toque para descarregar</p>
      </div>

      <div className={`w-9 h-9 rounded-lg ${theme.accentLight} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <Download className={`w-4 h-4 ${theme.textAccent}`} />
      </div>
    </a>
  );
};

export default ProfileFileSection;
