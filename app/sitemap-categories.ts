import { MetadataRoute } from 'next';

const API_URL = 'https://api.mapleepoch.com/wp-json/wp/v2';
const FRONTEND_URL = 'https://www.mapleepoch.com';

interface WordPressCategory {
  id: number;
  slug: string;
  name: string;
  count: number;
  description: string;
}

/**
 * Fetches all categories from WordPress
 * @returns Array of categories with metadata
 */
async function getAllCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetch(
      `${API_URL}/categories?_fields=id,slug,name,count,description&per_page=100&hide_empty=true&orderby=count&order=desc`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 1800 }, // Cache for 30 minutes
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch categories for sitemap: ${response.status}`);
      return [];
    }

    const categories: WordPressCategory[] = await response.json();
    
    // Filter categories that have posts
    const categoriesWithPosts = categories.filter(category => category.count > 0);
    
    console.log(`Fetched ${categoriesWithPosts.length} categories for category sitemap`);
    return categoriesWithPosts;
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    return [];
  }
}

/**
 * Strips HTML tags from a string
 * @param html - HTML string to clean
 * @returns Plain text string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Escapes XML special characters
 * @param text - Text to escape
 * @returns XML-safe string
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates category-specific sitemap XML
 * @returns Response with XML content
 */
export async function GET(): Promise<Response> {
  try {
    // Fetch categories from WordPress
    const categories = await getAllCategories();
    
    // Generate XML content
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map((category) => {
  const cleanName = escapeXml(stripHtml(category.name));
  const cleanDescription = escapeXml(stripHtml(category.description || ''));
  const lastModified = new Date().toISOString();
  
  return `  <url>
    <loc>${FRONTEND_URL}/${category.slug}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
}).join('\n')}
</urlset>`;

    console.log(`Generated category sitemap with ${categories.length} categories`);
    
    return new Response(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
      },
    });
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    
    // Return empty sitemap on error
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    
    return new Response(emptyXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes on error
      },
    });
  }
}