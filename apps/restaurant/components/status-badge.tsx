import { Clock, CheckCircle, Utensils, Package, Check, XCircle, Truck, type LucideIcon } from 'lucide-react';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  iconColor: string;
}

const statusConfig: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
    iconColor: 'text-yellow-600',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: CheckCircle,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
  },
  PREPARING: {
    label: 'Preparing',
    icon: Utensils,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    icon: Package,
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    iconColor: 'text-indigo-600',
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    icon: Truck,
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: Check,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    iconColor: 'text-green-600',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'px-3 py-1 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'px-4 py-1.5 text-base',
    icon: 'w-5 h-5',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const styles = sizeStyles[size];

  // Safety check: if status is invalid, show a default badge
  if (!config) {
    return (
      <span
        className={`
          inline-flex items-center gap-1.5 rounded-full font-medium
          bg-gray-100 text-gray-700 ${styles.container}
        `}
      >
        <Clock className={`text-gray-600 ${styles.icon}`} />
        <span>{status || 'Unknown'}</span>
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bgColor} ${config.textColor} ${styles.container}
      `}
    >
      <Icon className={`${config.iconColor} ${styles.icon}`} />
      <span>{config.label}</span>
    </span>
  );
}
