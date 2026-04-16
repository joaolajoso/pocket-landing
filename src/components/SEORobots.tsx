
import { useEffect } from 'react';

const SEORobots = () => {
  useEffect(() => {
    generateRobotsTxt();
  }, []);

  const generateRobotsTxt = () => {
    const baseUrl = window.location.origin;
    
    const robotsTxt = `User-agent: *
Allow: /
Allow: /login
Disallow: /dashboard
Disallow: /preview
Disallow: /business-preview
Disallow: /onboarding/*
Disallow: /u/*/edit

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Block common bot paths
User-agent: *
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

# Allow search engines to crawl user profiles
User-agent: Googlebot
Allow: /u/*
Allow: /*

User-agent: Bingbot
Allow: /u/*
Allow: /*`;

    // Log the robots.txt for development purposes
    console.log('Generated robots.txt:', robotsTxt);
    
    // Store robots.txt in sessionStorage for potential server-side rendering
    sessionStorage.setItem('robotstxt', robotsTxt);
    
    // Create a downloadable robots.txt file
    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
  };

  return null; // This component doesn't render anything
};

export default SEORobots;
