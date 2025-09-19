import { MetadataRoute } from 'next';

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
  count: number;
  name: string;
}

/**
 * Fetches all published posts from WordPress with pagination
 * @returns Array of all posts with slug and modified date
 */
async function getAllPosts(): Promise<WordPressPost[]> {
  const allPosts: WordPressPost[] = [];
  let page = 1;
  let hasMorePosts = true;

  while (hasMorePosts) {
    try {
      const response = await fetch(
        `${API_URL}/posts?_fields=id,slug,modified,date,status&per_page=100&page=${page}&status=publish&orderby=modified&order=desc`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch posts page ${page}: ${response.status} ${response.statusText}`);
        break;
      }

      const posts: WordPressPost[] = await response.json();
      
      if (posts.length === 0) {
        hasMorePosts = false;
      } else {
        // Filter only published posts
        const publishedPosts = posts.filter(post => post.status === 'publish');
        allPosts.push(...publishedPosts);
        page++;
      }

      // Safety check to prevent infinite loops
      if (page > 200) {
        console.warn('Reached maximum page limit (200) for sitemap generation');
        break;
      }
    } catch (error) {
      console.error(`Error fetching posts page ${page}:`, error);
      break;
    }
  }

  console.log(`Fetched ${allPosts.length} published posts for sitemap`);
  return allPosts;
}

/**
 * Fetches all categories from WordPress
 * @returns Array of all categories with slug and post count
 */
async function getAllCategories(): Promise<WordPressCategory[]> {
  try {
    const response = await fetch(
      `${API_URL}/categories?_fields=id,slug,count,name&per_page=100&hide_empty=true`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      return [];
    }

    const categories: WordPressCategory[] = await response.json();
    
    // Filter categories that have posts
    const categoriesWithPosts = categories.filter(category => category.count > 0);
    
    console.log(`Fetched ${categoriesWithPosts.length} categories with posts for sitemap`);
    return categoriesWithPosts;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Generates comprehensive sitemap with all pages and dynamic content
 * @returns Sitemap entries for all content
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();
  
  // Static pages with specific priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage - highest priority
    {
      url: FRONTEND_URL,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    
    // Main category pages - high priority
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
      priority: 0.9,
    },
    
    // World subcategories
    {
      url: `${FRONTEND_URL}/world/africa`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/world/americas`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/world/australia`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/world/asia`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/world/europe`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/world/uk`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/world/canada`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // Special sections
    {
      url: `${FRONTEND_URL}/daily-maple`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/maple-travel`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/through-the-lens`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/featured-articles`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/maple-voices`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/explore-canada`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/resources`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/events`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/booknook`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/the-friday-post`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/editors-picks`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${FRONTEND_URL}/you-may-have-missed`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // Static informational pages - lower priority
    {
      url: `${FRONTEND_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${FRONTEND_URL}/search`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${FRONTEND_URL}/write-for-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${FRONTEND_URL}/shop-a-tale`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    // Fetch all posts and categories from WordPress
    const [posts, categories] = await Promise.allSettled([
      getAllPosts(),
      getAllCategories()
    ]);

    // Process posts
    const postEntries: MetadataRoute.Sitemap = [];
    if (posts.status === 'fulfilled' && posts.value.length > 0) {
      posts.value.forEach((post) => {
        // Validate post data
        if (post.slug && post.modified) {
          postEntries.push({
            url: `${FRONTEND_URL}/article/${post.slug}`,
            lastModified: post.modified,
            changeFrequency: 'daily' as const,
            priority: 0.8,
          });
        }
      });
    }

    // Process categories (dynamic category pages from WordPress)
    const categoryEntries: MetadataRoute.Sitemap = [];
    if (categories.status === 'fulfilled' && categories.value.length > 0) {
      categories.value.forEach((category) => {
        // Only include categories that have posts and valid slugs
        if (category.slug && category.count > 0) {
          // Skip categories that are already covered by static pages
          const staticCategorySlugs = [
            'politics', 'business', 'technology', 'health', 'sports', 
            'entertainment', 'lifestyle', 'world', 'africa', 'americas', 
            'australia', 'asia', 'europe', 'uk', 'canada'
          ];
          
          if (!staticCategorySlugs.includes(category.slug)) {
            categoryEntries.push({
              url: `${FRONTEND_URL}/${category.slug}`,
              lastModified: currentDate,
              changeFrequency: 'daily' as const,
              priority: 0.9,
            });
          }
        }
      });
    }

    // Combine all entries
    const allEntries = [...staticPages, ...categoryEntries, ...postEntries];

    // Remove duplicates based on URL
    const uniqueEntries = allEntries.filter((entry, index, self) => 
      index === self.findIndex(e => e.url === entry.url)
    );

    // Sort by priority (highest first) then by URL
    const sortedEntries = uniqueEntries.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.url.localeCompare(b.url);
    });

    console.log(`Generated sitemap with ${staticPages.length} static pages, ${categoryEntries.length} dynamic categories, and ${postEntries.length} posts (${sortedEntries.length} total unique entries)`);
    
    return sortedEntries;
  } catch (error) {
    console.error('Error generating comprehensive sitemap:', error);
    
    // Return static pages only if WordPress fetch fails
    console.log('Falling back to static pages only due to WordPress API error');
    return staticPages;
  }
}