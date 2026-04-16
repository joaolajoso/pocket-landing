import { Service } from '@/types/organizationWebsite';

export interface ServicesBlockProps {
  title?: string;
  services: Service[];
  columns?: 2 | 3 | 4;
  backgroundColor?: string;
}

export const ServicesBlock = ({
  title = 'Nossos Serviços',
  services,
  columns = 3,
  backgroundColor = '#f9fafb'
}: ServicesBlockProps) => {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  };

  return (
    <section className="py-16 px-6" style={{ backgroundColor }}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          {title}
        </h2>
        
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {service.icon && (
                <div className="w-12 h-12 mb-4 text-primary">
                  <span className="text-4xl">{service.icon}</span>
                </div>
              )}
              
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                {service.name}
              </h3>
              
              {service.description && (
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
