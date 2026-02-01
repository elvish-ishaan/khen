import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Khen Restaurant Portal',
  description: 'Restaurant management portal for Khen food delivery platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
