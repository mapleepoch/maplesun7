import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, User, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getPostsByCategory, transformPost, fallbackPosts } from '@/lib/wordpress';

async function getCanadaData() {
  try {
    const posts = await getPostsByCategory('canada', 12);
    return posts.length > 0 ? posts.map(transformPost).filter(Boolean) : fallbackPosts.slice(0, 12);
  } catch (error) {
    console.error('Error fetching Canada data:', error);
    return fallbackPosts.slice(0, 12);
  }
}

export default async function CanadaPage() {
  const articles = await getCanadaData();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="pt-32">
        {/* Breadcrumb */}
        <div className="bg-gray-50 dark:bg-gray-800 py-4">
          <div className="container mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/world" className="hover:text-red-600 transition-colors">World</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white">Canada</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Canada News</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Latest news and developments from Canada. 
                Politics, economics, culture, and society from the Great White North.
              </p>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="container mx-auto px-4 py-12">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <div 
                  key={article.id}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <img 
                      src={article.image} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex space-x-2">
                      <Badge className="bg-red-600 hover:bg-red-700 text-white">
                        CANADA
                      </Badge>
                      {article.isTrending && (
                        <Badge className="bg-white hover:bg-gray-100 text-red-600">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          TRENDING
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                      <Link href={`/article/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{article.views}</span>
                      </div>
                    </div>
                    
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Link href={`/article/${article.slug}`}>
                        Read Full Story
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Canada News Available
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                We're working to bring you the latest news from Canada. Please check back soon.
              </p>
              <Button asChild>
                <Link href="/world">Back to World News</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}