/**
 * Utility functions for sitemap generation and validation
 */

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Validates a URL for sitemap inclusion
 * @param url - URL to validate
 * @returns Boolean indicating if URL is valid
 */
export function isValidSitemapUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check if it's from our domain
    if (!url.startsWith('https://www.mapleepoch.com')) {
      return false;
    }
    
    // Exclude certain paths
    const excludedPaths = [
      '/api/',
      '/dashboard/',
      '/auth/',
      '/admin/',
      '/_next/',
      '/wp-admin/',
      '/wp-content/',
      '/wp-includes/'
    ];
    
    return !excludedPaths.some(path => urlObj.pathname.startsWith(path));
  } catch (error) {
    return false;
  }
}

/**
 * Normalizes a URL for consistent sitemap formatting
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export function normalizeSitemapUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove trailing slash except for root
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    // Remove query parameters and fragments for clean URLs
    urlObj.search = '';
    urlObj.hash = '';
    
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

/**
 * Determines priority based on URL path
 * @param url - URL to analyze
 * @returns Priority value between 0.0 and 1.0
 */
export function calculateUrlPriority(url: string): number {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Homepage
    if (path === '/') return 1.0;
    
    // Main category pages
    const mainCategories = [
      '/world', '/politics', '/business', '/technology', 
      '/health', '/sports', '/entertainment', '/lifestyle'
    ];
    if (mainCategories.includes(path)) return 0.9;
    
    // Special sections
    const specialSections = [
      '/daily-maple', '/maple-travel', '/through-the-lens',
      '/featured-articles', '/maple-voices', '/explore-canada',
      '/resources', '/events', '/booknook', '/the-friday-post',
      '/editors-picks', '/you-may-have-missed'
    ];
    if (specialSections.includes(path)) return 0.9;
    
    // World subcategories
    if (path.startsWith('/world/')) return 0.9;
    
    // Article pages
    if (path.startsWith('/article/')) return 0.8;
    
    // Other dynamic category pages
    if (path.split('/').length === 2 && path !== '/') return 0.9;
    
    // Static pages
    return 0.7;
  } catch (error) {
    return 0.5; // Default priority
  }
}

/**
 * Determines change frequency based on URL path
 * @param url - URL to analyze
 * @returns Change frequency string
 */
export function calculateChangeFrequency(url: string): SitemapEntry['changeFrequency'] {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Homepage - changes frequently
    if (path === '/') return 'hourly';
    
    // Category pages and special sections - daily updates
    const dynamicPages = [
      '/world', '/politics', '/business', '/technology', 
      '/health', '/sports', '/entertainment', '/lifestyle',
      '/daily-maple', '/maple-travel', '/through-the-lens',
      '/featured-articles', '/maple-voices', '/explore-canada',
      '/resources', '/events', '/booknook', '/the-friday-post',
      '/editors-picks', '/you-may-have-missed'
    ];
    if (dynamicPages.includes(path) || path.startsWith('/world/')) return 'daily';
    
    // Article pages - updated occasionally
    if (path.startsWith('/article/')) return 'daily';
    
    // Other dynamic categories
    if (path.split('/').length === 2 && path !== '/') return 'daily';
    
    // Static pages - rarely change
    return 'monthly';
  } catch (error) {
    return 'weekly'; // Default frequency
  }
}

/**
 * Validates sitemap entry data
 * @param entry - Sitemap entry to validate
 * @returns Boolean indicating if entry is valid
 */
export function validateSitemapEntry(entry: SitemapEntry): boolean {
  // Check required fields
  if (!entry.url || !entry.lastModified) {
    return false;
  }
  
  // Validate URL
  if (!isValidSitemapUrl(entry.url)) {
    return false;
  }
  
  // Validate priority range
  if (entry.priority < 0 || entry.priority > 1) {
    return false;
  }
  
  // Validate lastModified date
  try {
    new Date(entry.lastModified);
  } catch (error) {
    return false;
  }
  
  return true;
}

/**
 * Removes duplicate URLs from sitemap entries
 * @param entries - Array of sitemap entries
 * @returns Deduplicated array
 */
export function deduplicateSitemapEntries(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  const deduplicated: SitemapEntry[] = [];
  
  for (const entry of entries) {
    const normalizedUrl = normalizeSitemapUrl(entry.url);
    
    if (!seen.has(normalizedUrl) && validateSitemapEntry(entry)) {
      seen.add(normalizedUrl);
      deduplicated.push({
        ...entry,
        url: normalizedUrl
      });
    }
  }
  
  return deduplicated;
}

/**
 * Logs sitemap generation statistics
 * @param entries - Array of sitemap entries
 */
export function logSitemapStats(entries: SitemapEntry[]): void {
  const stats = {
    total: entries.length,
    byPriority: {} as Record<string, number>,
    byChangeFreq: {} as Record<string, number>,
    byPath: {} as Record<string, number>
  };
  
  entries.forEach(entry => {
    // Count by priority
    const priority = entry.priority.toString();
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    
    // Count by change frequency
    stats.byChangeFreq[entry.changeFrequency] = (stats.byChangeFreq[entry.changeFrequency] || 0) + 1;
    
    // Count by path type
    try {
      const urlObj = new URL(entry.url);
      const pathType = urlObj.pathname === '/' ? 'homepage' : 
                     urlObj.pathname.startsWith('/article/') ? 'articles' :
                     urlObj.pathname.startsWith('/world/') ? 'world-subcategories' :
                     urlObj.pathname.split('/').length === 2 ? 'categories' : 'other';
      stats.byPath[pathType] = (stats.byPath[pathType] || 0) + 1;
    } catch (error) {
      stats.byPath['invalid'] = (stats.byPath['invalid'] || 0) + 1;
    }
  });
  
  console.log('Sitemap generation statistics:', {
    totalEntries: stats.total,
    priorityDistribution: stats.byPriority,
    changeFrequencyDistribution: stats.byChangeFreq,
    pathTypeDistribution: stats.byPath
  });
}