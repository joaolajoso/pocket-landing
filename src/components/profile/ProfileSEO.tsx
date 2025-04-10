
import { Helmet } from 'react-helmet';

interface ProfileSEOProps {
  name: string;
  bio: string;
  photoUrl?: string;
}

const ProfileSEO: React.FC<ProfileSEOProps> = ({ name, bio, photoUrl }) => {
  return (
    <Helmet>
      <title>{name || 'Profile'} | PocketCV</title>
      <meta name="description" content={bio || `${name}'s online resume and contact information`} />
      <meta property="og:title" content={`${name} | PocketCV`} />
      <meta property="og:description" content={bio || `${name}'s online resume and contact information`} />
      {photoUrl && <meta property="og:image" content={photoUrl} />}
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={window.location.href} />
    </Helmet>
  );
};

export default ProfileSEO;
