export interface Stat {
  label: string;
  value: string | number;
  icon?: string;
}

export interface StatsBlockProps {
  stats: Stat[];
  backgroundColor?: string;
  textColor?: string;
}

export const StatsBlock = ({
  stats,
  backgroundColor = '#0ea5e9',
  textColor = '#ffffff'
}: StatsBlockProps) => {
  return (
    <section 
      className="py-16 px-6"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              {stat.icon && (
                <div className="text-4xl mb-2">
                  {stat.icon}
                </div>
              )}
              
              <div className="text-4xl md:text-5xl font-bold mb-2">
                {stat.value}
              </div>
              
              <div className="text-sm md:text-base opacity-90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
