/**
 * Helper function to rewrite Yoast SEO URLs from API domain to frontend domain
 */

const API_DOMAIN = 'api.mapleepoch.com';
const FRONTEND_DOMAIN = 'www.mapleepoch.com';

/**
 * Rewrites URLs from the API domain to the frontend domain
 * @param url - The URL to rewrite
 * @returns The rewritten URL with the frontend domain
 */
export function rewriteUrl(url: string): string {
  if (!url) return url;
  
  // Handle both http and https protocols
  const apiDomainPattern = new RegExp(`https?://${API_DOMAIN.replace('.', '\\.')}`, 'g');
  return url.replace(apiDomainPattern, `https://${FRONTEND_DOMAIN}`);
}

/**
 * Recursively rewrites all URLs in an object from API domain to frontend domain
 * @param obj - The object to process
 * @returns The object with rewritten URLs
 */
export function rewriteYoastUrls<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (typeof obj === 'string') {
    return rewriteUrl(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => rewriteYoastUrls(item)) as T;
  }

  const result = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Rewrite URL fields
      if (key === 'url' || key === 'canonical' || key.includes('image') || key.includes('url')) {
        (result as any)[key] = rewriteUrl(value);
      } else {
        (result as any)[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      (result as any)[key] = rewriteYoastUrls(value);
    } else {
      (result as any)[key] = value;
    }
  }

  return result;
}

/**
 * Extracts and rewrites metadata from Yoast head JSON
 * @param yoastHead - The yoast_head_json object from WordPress
 * @returns Processed metadata for Next.js
 */
export function processYoastMetadata(yoastHead: any) {
  if (!yoastHead) {
    return {
      title: '',
      description: '',
      canonical: '',
      openGraph: {},
      twitter: {},
      schema: null
    };
  }

  // Rewrite all URLs in the Yoast data
  const rewrittenYoast = rewriteYoastUrls(yoastHead);

  return {
    title: rewrittenYoast.title || '',
    description: rewrittenYoast.description || '',
    canonical: rewrittenYoast.canonical || '',
    openGraph: {
      title: rewrittenYoast.og_title || rewrittenYoast.title || '',
      description: rewrittenYoast.og_description || rewrittenYoast.description || '',
      url: rewrittenYoast.og_url || rewrittenYoast.canonical || '',
      siteName: rewrittenYoast.og_site_name || 'The Maple Epoch',
      images: rewrittenYoast.og_image ? [{
        url: rewriteUrl(rewrittenYoast.og_image[0]?.url || rewrittenYoast.og_image),
        width: rewrittenYoast.og_image[0]?.width || 1200,
        height: rewrittenYoast.og_image[0]?.height || 630,
        alt: rewrittenYoast.og_image[0]?.alt || rewrittenYoast.title || ''
      }] : [],
      locale: rewrittenYoast.og_locale || 'en_US',
      type: rewrittenYoast.og_type || 'article'
    },
    twitter: {
      card: rewrittenYoast.twitter_card || 'summary_large_image',
      title: rewrittenYoast.twitter_title || rewrittenYoast.og_title || rewrittenYoast.title || '',
      description: rewrittenYoast.twitter_description || rewrittenYoast.og_description || rewrittenYoast.description || '',
      images: rewrittenYoast.twitter_image ? [rewriteUrl(rewrittenYoast.twitter_image)] : 
              rewrittenYoast.og_image ? [rewriteUrl(rewrittenYoast.og_image[0]?.url || rewrittenYoast.og_image)] : []
    },
    schema: rewrittenYoast.schema || null
  };
}