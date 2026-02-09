import type { Metadata } from 'next';
import Script from 'next/script';
import '@workspace/ui/styles/globals.css';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Daavat Logistics - Delivery Partner App',
  description: 'Delivery partner application for Daavat food delivery platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<span>loading...</span>}>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
          strategy="beforeInteractive"
        />
        {children}
        </Suspense>
      </body>
    </html>
  );
}
