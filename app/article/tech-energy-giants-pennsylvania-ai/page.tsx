import { ArticleClientPage } from '@/components/article-client-page';
import { getPostsByCategory, transformPost, TransformedPost, getLatestHeadlines } from '@/lib/wordpress';
import { notFound } from 'next/navigation';

async function getBusinessArticleData(): Promise<TransformedPost | null> {
  try {
    // Fetch business articles from WordPress
    const businessPosts = await getPostsByCategory('business', 10);
    
    if (businessPosts.length === 0) {
      return null;
    }

    // Look for the specific article about Pennsylvania AI hub
    const targetArticle = businessPosts.find(post => 
      post.title?.rendered?.toLowerCase().includes('pennsylvania') ||
      post.title?.rendered?.toLowerCase().includes('ai hub') ||
      (post.title?.rendered?.toLowerCase().includes('tech') && post.title?.rendered?.toLowerCase().includes('energy'))
    );

    if (targetArticle) {
      const transformed = transformPost(targetArticle);
      if (transformed) {
        return transformed;
      }
    }

    // If specific article not found, use the first business article
    const transformed = transformPost(businessPosts[0]);
    return transformed || null;
  } catch (error) {
    console.error('Error fetching business article:', error);
    return null;
  }
}

export default async function BusinessArticlePage() {
  const article = await getBusinessArticleData();
  
  if (!article) {
    notFound();
  }

  // Fetch latest headlines for the sidebar
  let latestHeadlines: TransformedPost[] = [];
  try {
    latestHeadlines = await getLatestHeadlines(3);
  } catch (error) {
    console.error('Error fetching latest headlines for sidebar:', error);
    latestHeadlines = [];
  }
  // Transform the article to match the expected format for ArticleClientPage
  const articleData = {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content, // This will now be properly formatted HTML from transformPost
    category: article.category,
    image: article.image,
    author: {
      name: article.author,
      bio: `${article.author} is a business correspondent covering technology, energy, and economic developments across North America.`,
      avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    publishDate: article.publishDate,
    readTime: article.readTime,
    views: article.views,
    likes: Math.floor(Math.random() * 500) + 50,
    comments: Math.floor(Math.random() * 100) + 10,
    shares: Math.floor(Math.random() * 200) + 20,
    tags: article.tags
  };
  
  return <ArticleClientPage article={articleData} latestHeadlines={latestHeadlines} />;
}