import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';

import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Suspense } from 'react';

const fontSans = Geist({
	subsets: ['latin'],
	variable: '--font-sans',
});

const fontMono = Geist_Mono({
	subsets: ['latin'],
	variable: '--font-mono',
});

export const metadata: Metadata = {
	title: 'Daavat - Food Delivery',
	description: 'Order food from your favorite restaurants with Daavat',
	manifest: '/manifest.webmanifest',
	themeColor: '#f59e0b',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
		title: 'Daavat',
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
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="application-name" content="Daavat" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Daavat" />
				<meta name="format-detection" content="telephone=no" />
				<meta name="mobile-web-app-capable" content="yes" />
				<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
			</head>
			<body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
				<Suspense fallback={<span>loading...</span>}>
				<Providers>{children}</Providers>
				</Suspense>
			</body>
		</html>
	);
}
