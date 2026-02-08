import { Clock, User, Eye } from 'lucide-react';
import { StatusBadge, type OrderStatus } from './status-badge';
import { Button } from './ui/button';

export interface OrderCardProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
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
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-500 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">#{order.orderNumber}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Customer Info */}
      <div className="mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {order.user.name || 'Customer'}
          </p>
          <p className="text-xs text-gray-500">{order.user.phone}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {displayItems.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {item.menuItem?.name || 'Item'} × {item.quantity}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
              +{remainingCount} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Total and CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(order.total)}</p>
        </div>
        <Button
          variant="primary"
          size="md"
          icon={Eye}
          onClick={() => onViewDetails(order.id)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
