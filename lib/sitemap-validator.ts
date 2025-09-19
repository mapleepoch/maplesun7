/**
 * Sitemap validation utilities for ensuring XML compliance and SEO best practices
 */

export interface SitemapValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalUrls: number;
    duplicateUrls: number;
    invalidUrls: number;
    priorityDistribution: Record<string, number>;
  };
}

/**
 * Validates a complete sitemap for compliance and best practices
 * @param sitemapEntries - Array of sitemap entries to validate
 * @returns Validation result with errors, warnings, and statistics
 */
export function validateSitemap(sitemapEntries: any[]): SitemapValidationResult {
  const result: SitemapValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalUrls: sitemapEntries.length,
      duplicateUrls: 0,
      invalidUrls: 0,
      priorityDistribution: {}
    }
  };

  // Check sitemap size limits
  if (sitemapEntries.length > 50000) {
    result.errors.push('Sitemap exceeds maximum limit of 50,000 URLs');
    result.isValid = false;
  }

  if (sitemapEntries.length > 45000) {
    result.warnings.push('Sitemap is approaching the 50,000 URL limit');
  }

  // Track URLs for duplicate detection
  const seenUrls = new Set<string>();
  const priorities: Record<string, number> = {};

  sitemapEntries.forEach((entry, index) => {
    // Validate required fields
    if (!entry.url) {
      result.errors.push(`Entry ${index + 1}: Missing URL`);
      result.stats.invalidUrls++;
      result.isValid = false;
      return;
    }

    // Check for duplicates
    if (seenUrls.has(entry.url)) {
      result.errors.push(`Duplicate URL found: ${entry.url}`);
      result.stats.duplicateUrls++;
      result.isValid = false;
    } else {
      seenUrls.add(entry.url);
    }

    // Validate URL format
    try {
      const url = new URL(entry.url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(url.protocol)) {
        result.errors.push(`Invalid protocol for URL: ${entry.url}`);
        result.stats.invalidUrls++;
        result.isValid = false;
      }
      
      // Check domain consistency
      if (!entry.url.startsWith(FRONTEND_URL)) {
        result.warnings.push(`URL uses different domain: ${entry.url}`);
      }
    } catch (error) {
      result.errors.push(`Invalid URL format: ${entry.url}`);
      result.stats.invalidUrls++;
      result.isValid = false;
    }

    // Validate priority
    if (entry.priority !== undefined) {
      if (typeof entry.priority !== 'number' || entry.priority < 0 || entry.priority > 1) {
        result.errors.push(`Invalid priority for ${entry.url}: ${entry.priority}`);
        result.isValid = false;
      } else {
        const priorityKey = entry.priority.toString();
        priorities[priorityKey] = (priorities[priorityKey] || 0) + 1;
      }
    }

    // Validate lastModified
    if (entry.lastModified) {
      try {
        const date = new Date(entry.lastModified);
        if (isNaN(date.getTime())) {
          result.errors.push(`Invalid lastModified date for ${entry.url}: ${entry.lastModified}`);
          result.isValid = false;
        }
        
        // Check if date is in the future
        if (date > new Date()) {
          result.warnings.push(`Future lastModified date for ${entry.url}: ${entry.lastModified}`);
        }
      } catch (error) {
        result.errors.push(`Invalid lastModified format for ${entry.url}: ${entry.lastModified}`);
        result.isValid = false;
      }
    }

    // Validate changeFrequency
    const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    if (entry.changeFrequency && !validFrequencies.includes(entry.changeFrequency)) {
      result.errors.push(`Invalid changeFrequency for ${entry.url}: ${entry.changeFrequency}`);
      result.isValid = false;
    }
  });

  result.stats.priorityDistribution = priorities;

  // Additional SEO best practice checks
  if (sitemapEntries.length === 0) {
    result.errors.push('Sitemap is empty');
    result.isValid = false;
  }

  // Check for homepage
  const hasHomepage = sitemapEntries.some(entry => entry.url === FRONTEND_URL);
  if (!hasHomepage) {
    result.warnings.push('Homepage not found in sitemap');
  }

  // Check priority distribution
  const homepageEntries = sitemapEntries.filter(entry => entry.priority === 1.0);
  if (homepageEntries.length > 1) {
    result.warnings.push('Multiple URLs with priority 1.0 found');
  }

  return result;
}

async function generateStaticSitemap(): Promise<string> {
  const currentDate = new Date().toISOString();
  
  const staticPages = [
    { url: FRONTEND_URL, priority: 1.0, changefreq: 'hourly' },
    { url: `${FRONTEND_URL}/about`, priority: 0.7, changefreq: 'monthly' },
    { url: `${FRONTEND_URL}/world`, priority: 0.9, changefreq: 'daily' },
    { url: `${FRONTEND_URL}/politics`, priority: 0.9, changefreq: 'daily' },
    { url: `${FRONTEND_URL}/business`, priority: 0.9, changefreq: 'daily' },
    { url: `${FRONTEND_URL}/technology`, priority: 0.9, changefreq: 'daily' },
    { url: `${FRONTEND_URL}/health`, priority: 0.9, changefreq: 'daily' },
    { url: `${FRONTEND_URL}/sports`, priority: 0.9, changefreq: 'daily' },
    { url: `${FRONTEND_URL}/entertainment`, priority: 0.9, changefreq: 'daily' },
    { url: `${FRONTEND_URL}/lifestyle`, priority: 0.9, changefreq: 'daily' },
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
    
    // Add homepage
    allUrls.push(`  <url>
    <loc>${FRONTEND_URL}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>`);
    
    // Add static pages
    const staticPages = [
      { path: '/about', priority: 0.7, changefreq: 'monthly' },
      { path: '/search', priority: 0.7, changefreq: 'weekly' },
      { path: '/write-for-us', priority: 0.7, changefreq: 'monthly' },
      { path: '/shop-a-tale', priority: 0.7, changefreq: 'weekly' },
    ];
    
    staticPages.forEach(page => {
      allUrls.push(`  <url>
    <loc>${FRONTEND_URL}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    });
    
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