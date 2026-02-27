/**
 * Root Layout
 *
 * Provides the base HTML structure, metadata, and global providers.
 */

import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mumbaitransport.in'),
  title: {
    default: 'MumbaiLocal - Real-Time Mumbai Transport Updates',
    template: '%s | MumbaiLocal',
  },
  description:
    'Live Mumbai local train, metro, and BEST bus updates. Real-time delays, crowd info, and last train timings. Works offline.',
  keywords: [
    'Mumbai Local',
    'Mumbai Train',
    'Mumbai Metro',
    'BEST Bus',
    'Local Train Time Table',
    'Mumbai Transport',
    'Real-time Train Status',
    'Train Delays',
    'Mumbai Railway',
    'Western Line',
    'Central Line',
    'Harbour Line',
  ],
  authors: [{ name: 'MumbaiLocal Team' }],
  creator: 'MumbaiLocal',
  publisher: 'MumbaiLocal',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://mumbaitransport.in/',
    siteName: 'MumbaiLocal',
    title: 'MumbaiLocal - Real-Time Mumbai Transport Updates',
    description:
      'Live Mumbai local train, metro, and BEST bus updates. Real-time delays, crowd info, and last train timings.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MumbaiLocal - Real-Time Transport Updates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MumbaiLocal - Real-Time Mumbai Transport Updates',
    description: 'Live Mumbai local train, metro, and BEST bus updates.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'transport',
  classification: 'Transportation App',
  applicationName: 'MumbaiLocal',
  appleWebApp: {
    capable: true,
    title: 'MumbaiLocal',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed: ', error);
                    });
                });
              }
            `,
          }}
        />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ErrorBoundary>
          {children}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
