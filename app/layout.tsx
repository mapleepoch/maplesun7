import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  // Basic metadata - pages will override with Yoast SEO data
  metadataBase: new URL('https://www.mapleepoch.com'),
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  // Global metadata that applies to all pages unless overridden
  keywords: 'news, breaking news, politics, business, technology, health, sports, entertainment, world news',
  authors: [{ name: 'The Maple Epoch Editorial Team' }],
  creator: 'The Maple Epoch',
  publisher: 'The Maple Epoch',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense Auto Ads - Only load in production */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2991745390432381"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`${inter.className} ${inter.variable}`}>
        <ErrorBoundary>
          <Providers>
            <Suspense fallback={
              <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
              </div>
            }>
              {children}
            </Suspense>
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}