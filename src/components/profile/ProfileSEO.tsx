
import { Helmet } from 'react-helmet';

interface ProfileSEOProps {
  name: string;
  bio: string;
  photoUrl?: string;
  username?: string;
}

const ProfileSEO: React.FC<ProfileSEOProps> = ({ name, bio, photoUrl, username }) => {
  // Generate dynamic preview image URL based on profile data
  const generatePreviewImageUrl = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      name: name || 'User',
      bio: bio || `${name}'s PocketCV profile`,
      username: username || 'user',
      avatar: photoUrl || ''
    });
    
    // For now, use the default preview image
    // In a production app, you'd generate this dynamically
    return "/lovable-uploads/688c189b-8d6f-48f5-82a5-24112297c4b1.png";
  };

  const previewImageUrl = generatePreviewImageUrl();
  const profileTitle = `${name || 'Profile'} | PocketCV`;
  const profileDescription = bio || `${name}'s online resume and contact information`;
  
  return (
    <Helmet>
      <title>{profileTitle}</title>
      <meta name="description" content={profileDescription} />
      <meta property="og:title" content={profileTitle} />
      <meta property="og:description" content={profileDescription} />
      <meta property="og:image" content={previewImageUrl} />
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={window.location.href} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={profileTitle} />
      <meta property="twitter:description" content={profileDescription} />
      <meta property="twitter:image" content={previewImageUrl} />
      <link rel="image_src" href={previewImageUrl} />
    </Helmet>
  );
};

export default ProfileSEO;
