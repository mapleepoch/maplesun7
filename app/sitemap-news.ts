import { MetadataRoute } from 'next';

const API_URL = 'https://api.www.mapleepoch.com/wp-json/wp/v2';
const API_URL_MAIN = 'https://api.mapleepoch.com/wp-json/wp/v2';
const FRONTEND_URL = 'https://www.mapleepoch.com';

interface WordPressPost {
  slug: string;
  title: {
    rendered: string;
  };
  date: string;
}

/**
 * Fetches recent posts from WordPress (last 48 hours) with pagination
 * @returns Array of recent posts with slug, title, and date
 */
async function getRecentPosts(): Promise<WordPressPost[]> {
  const recentPosts: WordPressPost[] = [];
  
  // Calculate 48 hours ago in ISO format
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  let page = 1;
  let hasMorePosts = true;

  while (hasMorePosts && recentPosts.length < 100) { // Google News limit is 100 articles
    try {
      const response = await fetch(
        `${API_URL_MAIN}/posts?after=${fortyEightHoursAgo}&_fields=slug,title,date&per_page=100&page=${page}&status=publish&orderby=date&order=desc`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 1800 }, // Cache for 30 minutes
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch recent posts page ${page}: ${response.status}`);
        break;
      }

      const posts: WordPressPost[] = await response.json();
      
      if (posts.length === 0) {
        hasMorePosts = false;
      } else {
        recentPosts.push(...posts);
        page++;
      }

      // Safety check to prevent infinite loops
      if (page > 10) {
        console.warn('Reached maximum page limit (10) for news sitemap generation');
        break;
      }
    } catch (error) {
      console.error(`Error fetching recent posts page ${page}:`, error);
      break;
    }
  }

  // Limit to 100 articles (Google News requirement)
  return recentPosts.slice(0, 100);
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
 * Generates Google News sitemap XML
 * @returns Response with XML content
 */
export async function GET(): Promise<Response> {
  try {
    // Fetch recent posts from WordPress
    const posts = await getRecentPosts();
    
    // Generate XML content
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${posts.map((post) => {
  const cleanTitle = escapeXml(stripHtml(post.title.rendered));
  const publishDate = new Date(post.date).toISOString();
  
  return `  <url>
    <loc>${FRONTEND_URL}/article/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>The Maple Epoch</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${publishDate}</news:publication_date>
      <news:title>${cleanTitle}</news:title>
    </news:news>
  </url>`;
}).join('\n')}
</urlset>`;

    console.log(`Generated Google News sitemap with ${posts.length} recent articles`);
    
    return new Response(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating Google News sitemap:', error);
    
    // Return empty sitemap on error
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
    
    return new Response(emptyXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes on error
      },
    });
  }
}