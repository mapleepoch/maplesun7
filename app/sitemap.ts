import { MetadataRoute } from 'next';

const API_URL = 'https://api.www.mapleepoch.com/wp-json/wp/v2';
const API_URL_NEW = 'https://api.www.mapleepoch.com/wp-json/wp/v2';
const FRONTEND_URL = 'https://www.mapleepoch.com';

interface WordPressPost {
  slug: string;
  modified: string;
}

/**
 * Fetches all posts from WordPress with pagination
 * @returns Array of all posts with slug and modified date
 */
async function getAllPosts(): Promise<WordPressPost[]> {
  const allPosts: WordPressPost[] = [];
  let page = 1;
  let hasMorePosts = true;

  while (hasMorePosts) {
    try {
      const response = await fetch(
        `${API_URL_NEW}/posts?_fields=slug,modified&per_page=100&page=${page}&status=publish`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Disable caching for sitemap generation
          cache: 'no-store',
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
        allPosts.push(...posts);
        page++;
      }

      // Safety check to prevent infinite loops
      if (page > 100) {
        console.warn('Reached maximum page limit (100) for sitemap generation');
        break;
      }
    } catch (error) {
      console.error(`Error fetching posts page ${page}:`, error);
      break;
    }
  }

  return allPosts;
}

/**
 * Generates sitemap with all posts and static pages
 * @returns Sitemap entries for all content
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: FRONTEND_URL,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${FRONTEND_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${FRONTEND_URL}/world`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/politics`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/business`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/technology`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/health`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/sports`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/entertainment`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/lifestyle`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${FRONTEND_URL}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    }
  ];

  try {
    // Fetch all posts from WordPress
    const posts = await getAllPosts();
    
    // Map posts to sitemap entries
    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${FRONTEND_URL}/${post.slug}`,
      lastModified: post.modified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    console.log(`Generated sitemap with ${staticPages.length} static pages and ${postEntries.length} posts`);
    
    return [...staticPages, ...postEntries];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return static pages only if WordPress fetch fails
    return staticPages;
  }
}