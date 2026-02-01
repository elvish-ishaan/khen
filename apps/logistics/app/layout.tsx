import type { Metadata } from 'next';
import '@workspace/ui/styles/globals.css';

export const metadata: Metadata = {
  title: 'Khen Logistics - Delivery Partner App',
  description: 'Delivery partner application for Khen food delivery platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
