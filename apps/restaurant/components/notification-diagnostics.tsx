'use client';

import { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { checkFcmStatus, requestNotificationPermission } from '@/lib/fcm';
import { restaurantApi } from '@/lib/api/restaurant.api';

export function NotificationDiagnostics() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState<Awaited<ReturnType<typeof checkFcmStatus>> | null>(null);

  const handleCheck = async () => {
    setIsChecking(true);
    const result = await checkFcmStatus();
    setStatus(result);
    setIsChecking(false);
  };

  const handleResetup = async () => {
    setIsChecking(true);
    const token = await requestNotificationPermission();
    if (token) {
      await restaurantApi.registerFcmToken(token);
      await handleCheck();
    } else {
      setIsChecking(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const result = await restaurantApi.testPushNotification();
      if (result.success) {
        alert('✅ Test notification sent! Check if you received it.');
      } else {
        alert('❌ Failed to send test notification: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error sending test notification: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setIsTesting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          handleCheck();
        }}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Check notification settings"
      >
        <Bell className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">🔔 Notification Diagnostics</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Checks */}
        {status && (
          <div className="space-y-2">
            <StatusItem
              label="HTTPS Enabled"
              status={status.isHttps}
              message={status.isHttps ? 'Using secure connection' : 'Service workers require HTTPS'}
            />
            <StatusItem
              label="Browser Support"
              status={status.isSupported}
              message={status.isSupported ? 'Notifications supported' : 'Browser does not support notifications'}
            />
            <StatusItem
              label="Permission"
              status={status.permission === 'granted'}
              message={
                status.permission === 'granted'
                  ? 'Notifications allowed'
                  : status.permission === 'denied'
                  ? 'Notifications blocked - check browser settings'
                  : 'Permission not yet granted'
              }
            />
            <StatusItem
              label="Service Worker"
              status={status.serviceWorkerActive}
              message={status.serviceWorkerActive ? 'Service worker is active' : 'Service worker not registered'}
            />
            <StatusItem
              label="VAPID Key"
              status={status.vapidKeyConfigured}
              message={status.vapidKeyConfigured ? 'VAPID key configured' : 'VAPID key missing'}
            />
          </div>
        )}

        {/* Issues */}
        {status && status.issues.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900 mb-2">Issues Found:</p>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  {status.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {status && status.issues.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-900 font-medium">
                ✅ All checks passed! Notifications should work.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleCheck}
            disabled={isChecking}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Re-check Status
              </>
            )}
          </button>

          <button
            onClick={handleResetup}
            disabled={isChecking}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Re-setup Notifications
          </button>

          <button
            onClick={handleTestNotification}
            disabled={isTesting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isTesting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Send Test Notification
              </>
            )}
          </button>
        </div>

        {/* Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-900">
          <p className="font-medium mb-2">💡 Troubleshooting Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Ensure you're accessing the app via HTTPS (not HTTP)</li>
            <li>Check browser notification settings (not blocked)</li>
            <li>Try a different browser (Chrome/Firefox recommended)</li>
            <li>Clear browser cache and reload the page</li>
            <li>Check browser console for detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status, message }: { label: string; status: boolean; message: string }) {
  return (
    <div className="flex items-start gap-2">
      {status ? (
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className={`text-xs ${status ? 'text-green-700' : 'text-red-700'}`}>{message}</p>
      </div>
    </div>
  );
}
