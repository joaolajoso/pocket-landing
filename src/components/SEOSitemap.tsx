
import { useEffect } from 'react';

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const SEOSitemap = () => {
  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = () => {
    const baseUrl = window.location.origin;
    const currentDate = new Date().toISOString().split('T')[0];
    
    const sitemapEntries: SitemapEntry[] = [
      // Main pages
      {
        loc: `${baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 1.0
      },
      {
        loc: `${baseUrl}/login`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: 0.5
      },
      // Dashboard pages (protected but indexable for SEO purposes)
      {
        loc: `${baseUrl}/dashboard`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.7
      },
      {
        loc: `${baseUrl}/business-preview`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.6
      }
    ];

    const sitemapXML = generateSitemapXML(sitemapEntries);
    
    // Create a downloadable sitemap file
    const blob = new Blob([sitemapXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    // Log the sitemap for development purposes
    console.log('Generated Sitemap XML:', sitemapXML);
    
    // In production, this would be served at /sitemap.xml
    // For now, we'll make it available for download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    
    // Store sitemap in sessionStorage for potential server-side rendering
    sessionStorage.setItem('sitemap', sitemapXML);
  };

  const generateSitemapXML = (entries: SitemapEntry[]): string => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const urlsetClose = '</urlset>';
    
    const urls = entries.map(entry => 
      `  <url>\n` +
      `    <loc>${entry.loc}</loc>\n` +
      (entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : '') +
      `    <changefreq>${entry.changefreq}</changefreq>\n` +
      `    <priority>${entry.priority.toFixed(1)}</priority>\n` +
      `  </url>`
    ).join('\n');
    
    return xmlHeader + urlsetOpen + urls + '\n' + urlsetClose;
  };

  return null; // This component doesn't render anything
};

export default SEOSitemap;
