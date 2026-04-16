import { Link } from 'react-router-dom';

export interface TeamMember {
  id: string;
  name: string;
  position?: string;
  photo_url?: string;
  bio?: string;
  slug?: string;
}

export interface TeamBlockProps {
  title?: string;
  members: TeamMember[];
  columns?: 2 | 3 | 4;
  showBio?: boolean;
}

export const TeamBlock = ({
  title = 'Nossa Equipe',
  members,
  columns = 3,
  showBio = false
}: TeamBlockProps) => {
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
        
        <div className={`grid grid-cols-1 ${gridCols[columns]} gap-8`}>
          {members.map((member) => {
            const content = (
              <>
                <div className="relative mb-4 mx-auto w-32 h-32 rounded-full overflow-hidden bg-muted group">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                      👤
                    </div>
                  )}
                  
                  {member.slug && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Ver Perfil →</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-1 text-foreground">
                  {member.name}
                </h3>
                
                {member.position && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {member.position}
                  </p>
                )}
                
                {showBio && member.bio && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </>
            );

            return member.slug ? (
              <Link
                key={member.id}
                to={`/${member.slug}`}
                className="block text-center transition-transform duration-300 hover:scale-105 hover:shadow-lg rounded-lg p-4 -m-4"
              >
                {content}
              </Link>
            ) : (
              <div key={member.id} className="text-center">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
