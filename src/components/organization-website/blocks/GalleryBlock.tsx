export interface GalleryItem {
  id: string;
  image_url: string;
  title?: string;
  description?: string;
}

export interface GalleryBlockProps {
  title?: string;
  items: GalleryItem[];
  columns?: 2 | 3 | 4;
}

export const GalleryBlock = ({
  title = 'Galeria',
  items,
  columns = 3
}: GalleryBlockProps) => {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4'
  };

  return (
    <section className="py-16 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          {title}
        </h2>
        
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg aspect-square bg-muted cursor-pointer"
            >
              <img
                src={item.image_url}
                alt={item.title || 'Gallery item'}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
              
              {(item.title || item.description) && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="text-white">
                    {item.title && (
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                    )}
                    {item.description && (
                      <p className="text-sm opacity-90">{item.description}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
