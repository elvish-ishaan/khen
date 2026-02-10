import type { Metadata } from 'next';
import Script from 'next/script';
import '@workspace/ui/styles/globals.css';
import { Suspense } from 'react';
import { AuthInitializer } from '@/components/auth-initializer';

export const metadata: Metadata = {
  title: 'Daavat Logistics - Delivery Partner App',
  description: 'Delivery partner application for Daavat food delivery platform',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Daavat Delivery',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <meta name="application-name" content="Daavat Delivery" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Daavat Delivery" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="overflow-x-hidden">
        <Suspense fallback={<span>loading...</span>}>
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
            strategy="beforeInteractive"
          />
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </Suspense>
      </body>
    </html>
  );
}
