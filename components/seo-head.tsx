import React from 'react';

interface YoastSEOData {
  title?: string;
  description?: string;
  canonical?: string;
  og_title?: string;
  og_description?: string;
  og_type?: string;
  og_url?: string;
  og_image?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }> | string;
  og_site_name?: string;
  og_locale?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema?: any;
}

interface SeoHeadProps {
  yoast: YoastSEOData | null;
}

/**
 * Rewrites URLs from API domain to frontend domain
 */
function rewriteUrl(url: string): string {
  if (!url) return url;
  return url.replace(/https?:\/\/api\.mapleepoch\.com/g, 'https://www.mapleepoch.com');
}

/**
 * SEO Head component that renders Yoast metadata into Next.js head
 * This component is used for rendering meta tags from WordPress Yoast SEO
 */
export default function SeoHead({ yoast }: SeoHeadProps) {
  if (!yoast) return null;

  // Rewrite URLs from API domain to frontend domain
  const rewrittenYoast = {
    ...yoast,
    canonical: rewriteUrl(yoast.canonical || ''),
    og_url: rewriteUrl(yoast.og_url || ''),
    og_image: yoast.og_image ? (
      Array.isArray(yoast.og_image) 
        ? yoast.og_image.map(img => ({ ...img, url: rewriteUrl(img.url) }))
        : rewriteUrl(yoast.og_image)
    ) : undefined,
    twitter_image: rewriteUrl(yoast.twitter_image || ''),
  };

  return (
    <>
      {/* Basic SEO */}
      {rewrittenYoast.title && <title>{rewrittenYoast.title}</title>}
      {rewrittenYoast.description && (
        <meta name="description" content={rewrittenYoast.description} />
      )}
      {rewrittenYoast.canonical && (
        <link rel="canonical" href={rewrittenYoast.canonical} />
      )}

      {/* Open Graph */}
      {rewrittenYoast.og_title && (
        <meta property="og:title" content={rewrittenYoast.og_title} />
      )}
      {rewrittenYoast.og_description && (
        <meta property="og:description" content={rewrittenYoast.og_description} />
      )}
      {rewrittenYoast.og_type && (
        <meta property="og:type" content={rewrittenYoast.og_type} />
      )}
      {rewrittenYoast.og_url && (
        <meta property="og:url" content={rewrittenYoast.og_url} />
      )}
      {rewrittenYoast.og_site_name && (
        <meta property="og:site_name" content={rewrittenYoast.og_site_name} />
      )}
      {rewrittenYoast.og_locale && (
        <meta property="og:locale" content={rewrittenYoast.og_locale} />
      )}
      
      {/* Open Graph Images */}
      {rewrittenYoast.og_image && (
        <>
          {Array.isArray(rewrittenYoast.og_image) ? (
            rewrittenYoast.og_image.map((img, index) => (
              <React.Fragment key={index}>
                <meta property="og:image" content={img.url} />
                {img.width && <meta property="og:image:width" content={img.width.toString()} />}
                {img.height && <meta property="og:image:height" content={img.height.toString()} />}
                {img.alt && <meta property="og:image:alt" content={img.alt} />}
              </React.Fragment>
            ))
          ) : (
            <meta property="og:image" content={rewrittenYoast.og_image} />
          )}
        </>
      )}

      {/* Twitter Card */}
      {rewrittenYoast.twitter_card && (
        <meta name="twitter:card" content={rewrittenYoast.twitter_card} />
      )}
      {rewrittenYoast.twitter_title && (
        <meta name="twitter:title" content={rewrittenYoast.twitter_title} />
      )}
      {rewrittenYoast.twitter_description && (
        <meta name="twitter:description" content={rewrittenYoast.twitter_description} />
      )}
      {rewrittenYoast.twitter_image && (
        <meta name="twitter:image" content={rewrittenYoast.twitter_image} />
      )}

      {/* Schema.org JSON-LD */}
      {rewrittenYoast.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              JSON.parse(JSON.stringify(rewrittenYoast.schema).replace(
                /https?:\/\/api\.mapleepoch\.com/g,
                'https://www.mapleepoch.com'
              ))
            )
          }}
        />
      )}
    </>
  );
}