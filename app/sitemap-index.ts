import { MetadataRoute } from 'next';

const FRONTEND_URL = 'https://www.mapleepoch.com';

/**
 * Generates a sitemap index that references all individual sitemaps
 * This helps with large sites and provides better organization
 */
export default function sitemapIndex(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();
  
  return [
    {
      url: `${FRONTEND_URL}/sitemap.xml`,
      lastModified: currentDate,
    },
    {
      url: `${FRONTEND_URL}/sitemap-news.xml`,
      lastModified: currentDate,
    },
    {
      url: `${FRONTEND_URL}/sitemap-categories.xml`,
      lastModified: currentDate,
    },
  ];
}