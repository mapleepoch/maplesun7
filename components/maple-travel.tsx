"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Eye, User, Mountain, ChevronDown, ChevronUp } from 'lucide-react';
import { TransformedPost } from '@/lib/wordpress';

interface MapleTravel {
  articles: TransformedPost[];
}

export const MapleTravel: React.FC<MapleTravel> = ({ articles }) => {
  const [showAll, setShowAll] = useState(false); // Default to "Show Less" mode
  const displayedArticles = showAll ? articles : articles.slice(0, 3);

  return (
    <section className="space-y-8">
      <div className="flex items-center space-x-3">
        <Mountain className="w-8 h-8 text-red-600" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Maple Travel
        </h2>
        <div className="flex-1 h-1 bg-red-600 rounded-full ml-4"></div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-xl p-6 mb-8">
        <div className="text-center">
          <Mountain className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Discover Canada's Natural Wonders
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From the Rocky Mountains to the Atlantic shores, explore Canada's breathtaking destinations 
            with expert guides, insider tips, and unforgettable travel experiences.
          </p>
        </div>
      </div>

      {displayedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedArticles.map((article) => (
            <div 
              key={article.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden w-full"
            >
              <div className="aspect-video relative">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute top-3 left-3 flex space-x-2">
                  <Badge className="bg-red-600 hover:bg-red-700 text-white">
                    <Mountain className="w-3 h-3 mr-1" />
                    MAPLE TRAVEL
                  </Badge>
                  {article.featured && (
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                      FEATURED
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs">
                    {article.category}
                  </Badge>
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
                    Explore Destination
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Mountain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Travel Articles Available
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Check back soon for the latest travel guides and destination insights.
          </p>
        </div>
      )}
      
      <div className="text-center">
        {articles.length > 3 && (
          <>
            <Button
              onClick={() => setShowAll(!showAll)}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 flex items-center space-x-2 mx-auto"
            >
              <span>{showAll ? 'Show Less' : 'View All Travel Guides'}</span>
              {showAll ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Showing {displayedArticles.length} of {articles.length} articles
            </p>
          </>
        )}
        {articles.length <= 3 && articles.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Showing {displayedArticles.length} of {articles.length} articles
          </p>
        )}
      </div>
    </section>
  );
};