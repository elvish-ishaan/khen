import { Clock, User, Eye } from 'lucide-react';
import { StatusBadge, type OrderStatus } from './status-badge';
import { Button } from './ui/button';

export interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
    subtotal: number;
    createdAt: string;
    user: {
      name?: string;
      phone: string;
    };
    items: any[];
  };
  onViewDetails: (orderId: string) => void;
}

export function OrderCard({ order, onViewDetails }: OrderCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Get display items (max 3 items, then "+X more")
  const displayItems = order.items.slice(0, 3);
  const remainingCount = order.items.length - 3;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-500 p-4 sm:p-6">
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">#{order.orderNumber}</h3>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-xs sm:text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{formatDate(order.createdAt)}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={order.status} size="sm" />
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4 flex items-center gap-2 min-w-0">
        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {order.user.name || 'Customer'}
          </p>
          <p className="text-xs text-gray-500 truncate">{order.user.phone}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {displayItems.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-xs rounded-full max-w-full truncate"
            >
              <span className="truncate">{item.menuItem?.name || 'Item'} × {item.quantity}</span>
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium flex-shrink-0">
              +{remainingCount} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Earnings and CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-100">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Your Earnings</p>
          <p className="text-lg sm:text-xl font-bold text-green-600 truncate">{formatCurrency(order.subtotal)}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Eye}
          onClick={() => onViewDetails(order.id)}
          className="w-full sm:w-auto flex-shrink-0"
        >
          <span className="sm:hidden">View</span>
          <span className="hidden sm:inline">View Details</span>
        </Button>
      </div>
    </div>
  );
}
