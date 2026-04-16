
import { useEffect, useRef } from 'react';

interface ProfilePreviewImageProps {
  name: string;
  bio: string;
  avatarUrl?: string;
  username: string;
  profileViews: number;
  linkClicks: number;
}

const ProfilePreviewImage = ({ 
  name, 
  bio, 
  avatarUrl, 
  username,
  profileViews,
  linkClicks 
}: ProfilePreviewImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for social media preview (1200x630)
    canvas.width = 1200;
    canvas.height = 630;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add PocketCV branding
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('PocketCV', 50, 60);

    // Profile section background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.roundRect(100, 150, 1000, 350, 20);
    ctx.fill();

    // Profile avatar placeholder (circle)
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.arc(200, 280, 60, 0, 2 * Math.PI);
    ctx.fill();

    // Profile info
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(name || 'Your Name', 300, 250);

    ctx.fillStyle = '#6b7280';
    ctx.font = '32px Arial';
    ctx.fillText(`@${username || 'username'}`, 300, 290);

    ctx.fillStyle = '#374151';
    ctx.font = '28px Arial';
    const bioText = bio || 'Your professional bio appears here';
    const truncatedBio = bioText.length > 60 ? bioText.substring(0, 60) + '...' : bioText;
    ctx.fillText(truncatedBio, 300, 330);

    // Stats
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`${profileViews} profile views this week`, 300, 380);
    ctx.fillText(`${linkClicks} link clicks this week`, 300, 410);

    // QR Code and Edit buttons (simplified representation)
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(850, 200, 80, 40);
    ctx.fillRect(950, 200, 80, 40);

    ctx.fillStyle = '#374151';
    ctx.font = '18px Arial';
    ctx.fillText('QR Code', 860, 225);
    ctx.fillText('Edit', 970, 225);

  }, [name, bio, avatarUrl, username, profileViews, linkClicks]);

  return (
    <canvas 
      ref={canvasRef}
      style={{ display: 'none' }}
      width={1200}
      height={630}
    />
  );
};

export default ProfilePreviewImage;
