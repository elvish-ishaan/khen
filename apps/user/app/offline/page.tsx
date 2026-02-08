'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
	const [isOnline, setIsOnline] = useState(false);

	useEffect(() => {
		// Check online status
		setIsOnline(navigator.onLine);

		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	const handleRetry = () => {
		if (navigator.onLine) {
			window.location.reload();
		}
	};

	if (isOnline) {
		// Auto-redirect if back online
		if (typeof window !== 'undefined') {
			window.location.href = '/';
		}
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="max-w-md w-full text-center">
				<div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
					<div className="flex justify-center">
						<div className="bg-gray-100 p-4 rounded-full">
							<WifiOff className="w-12 h-12 text-gray-600" />
						</div>
					</div>

					<div className="space-y-2">
						<h1 className="text-2xl font-bold text-gray-900">
							You&apos;re Offline
						</h1>
						<p className="text-gray-600">
							It looks like you&apos;ve lost your internet connection.
							Please check your network settings and try again.
						</p>
					</div>

					<button
						onClick={handleRetry}
						className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
					>
						<RefreshCw className="w-5 h-5" />
						Try Again
					</button>

					<div className="pt-4 border-t border-gray-200">
						<p className="text-sm text-gray-500">
							Some features may not be available while offline
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
