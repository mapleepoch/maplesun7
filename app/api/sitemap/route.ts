import { NextRequest, NextResponse } from 'next/server';

const API_URL = 'https://api.mapleepoch.com/wp-json/wp/v2';
const FRONTEND_URL = 'https://www.mapleepoch.com';

interface WordPressPost {
  id: number;
  slug: string;
  modified: string;
  date: string;
  status: string;
}

interface WordPressCategory {
  id: number;
  slug: string;
  name: string;
  count: number;
}

/**
 * API route for generating sitemap XML dynamically
 * This provides an alternative to the static sitemap.ts for more control
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'full';
    
    console.log(`Generating ${type} sitemap via API route`);
    
    let xmlContent = '';
    
    switch (type) {
      case 'posts':
        xmlContent = await generatePostsSitemap();
        break;
      case 'categories':
        xmlContent = await generateCategoriesSitemap();
        break;
      case 'static':
        xmlContent = await generateStaticSitemap();
        break;
      default:
        xmlContent = await generateFullSitemap();
    }
    
    return new Response(xmlContent, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap via API:', error);
    
    // Return minimal sitemap on error
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${FRONTEND_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new Response(errorXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes on error
      },
    });
  }
}

async function generatePostsSitemap(): Promise<string> {
  try {
    const posts = await fetchAllPosts();
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${posts.map((post) => `  <url>
    <loc>${FRONTEND_URL}/article/${post.slug}</loc>
    <lastmod>${post.modified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return xmlContent;
  } catch (error) {
    console.error('Error generating posts sitemap:', error);
    return generateEmptySitemap();
  }
}

async function generateCategoriesSitemap(): Promise<string> {
  try {
    const categories = await fetchAllCategories();
    const currentDate = new Date().toISOString();
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories.map((category) => `  <url>
    <loc>${FRONTEND_URL}/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return xmlContent;
  } catch (error) {
    console.error('Error generating categories sitemap:', error);
    return generateEmptySitemap();
  }
}

async function generateStaticSitemap(): Promise<string> {
  const currentDate = new Date().toISOString();
  
  const staticPages = [
    { url: FRONTEND_URL, priority: 1.0, changefreq: 'hourly' },
    { url: `${FRONTEND_URL}/about`, priority: 0.7, changefreq: 'monthly' },
    { url: `${FRONTEND_URL}/search`, priority: 0.7, changefreq: 'weekly' },
    { url: `${FRONTEND_URL}/write-for-us`, priority: 0.7, changefreq: 'monthly' },
    { url: `${FRONTEND_URL}/shop-a-tale`, priority: 0.7, changefreq: 'weekly' },
  ];
  
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return xmlContent;
}

async function generateFullSitemap(): Promise<string> {
  try {
    const [posts, categories] = await Promise.allSettled([
      fetchAllPosts(),
      fetchAllCategories()
    ]);
    
    const currentDate = new Date().toISOString();
    const allUrls: string[] = [];
    
    // Add static pages
    allUrls.push(`  <url>
    <loc>${FRONTEND_URL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`);
    
    // Add category pages
    if (categories.status === 'fulfilled') {
      categories.value.forEach((category) => {
        allUrls.push(`  <url>
    <loc>${FRONTEND_URL}/${category.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
      });
    }
    
    // Add post pages
    if (posts.status === 'fulfilled') {
      posts.value.forEach((post) => {
        allUrls.push(`  <url>
    <loc>${FRONTEND_URL}/article/${post.slug}</loc>
    <lastmod>${post.modified}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`);
      });
    }
    
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.join('\n')}
</urlset>`;
    
    return xmlContent;
  } catch (error) {
    console.error('Error generating full sitemap:', error);
    return generateEmptySitemap();
  }
}

async function fetchAllPosts(): Promise<WordPressPost[]> {
  const allPosts: WordPressPost[] = [];
  let page = 1;
  let hasMorePosts = true;

  while (hasMorePosts && allPosts.length < 10000) { // Reasonable limit
    try {
      const response = await fetch(
        `${API_URL}/posts?_fields=id,slug,modified,date,status&per_page=100&page=${page}&status=publish&orderby=modified&order=desc`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 3600 },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch posts page ${page}: ${response.status}`);
        break;
      }

      const posts: WordPressPost[] = await response.json();
      
      if (posts.length === 0) {
        hasMorePosts = false;
      } else {
        allPosts.push(...posts.filter(post => post.status === 'publish'));
        page++;
      }

      if (page > 100) {
        console.warn('Reached maximum page limit for API sitemap generation');
        break;
      }
    } catch (error) {
      console.error(`Error fetching posts page ${page}:`, error);
      break;
    }
  }

  return allPosts;
}

async function fetchAllCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetch(
      `${API_URL}/categories?_fields=id,slug,name,count&per_page=100&hide_empty=true`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch categories: ${response.status}`);
      return [];
    }

    const categories: WordPressCategory[] = await response.json();
    return categories.filter(category => category.count > 0);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function generateEmptySitemap(): string {
  const currentDate = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${FRONTEND_URL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
}