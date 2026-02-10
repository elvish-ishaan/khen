'use client';

import { useEffect, useState } from 'react';
import { logisticsApi } from '@/lib/api/logistics.api';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Package,
  Wallet,
  ArrowUpRight,
  AlertCircle,
} from 'lucide-react';

interface EarningSummary {
  totalEarnings: number;
  totalWithdrawn: number;
  pendingBalance: number;
  totalDeliveries: number;
}

interface Earning {
  id: string;
  amount: number;
  distance: number;
  createdAt: string;
  orderId: string;
}

interface EarningsData {
  earnings: Earning[];
  summary: EarningSummary;
}

export default function EarningsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Earnings data for different periods
  const [todayEarnings, setTodayEarnings] = useState<EarningsData | null>(null);
  const [weekEarnings, setWeekEarnings] = useState<EarningsData | null>(null);
  const [monthEarnings, setMonthEarnings] = useState<EarningsData | null>(null);
  const [allTimeEarnings, setAllTimeEarnings] = useState<EarningsData | null>(null);

  // Withdrawal state
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');
  const [withdrawalSuccess, setWithdrawalSuccess] = useState('');

  useEffect(() => {
    fetchAllEarnings();
  }, []);

  const fetchAllEarnings = async () => {
    try {
      setIsLoading(true);
      setError('');

      const now = new Date();

      // Today (start of day to now)
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      // Week (last 7 days)
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);

      // Month (last 30 days)
      const monthStart = new Date(now);
      monthStart.setDate(monthStart.getDate() - 30);

      const [todayRes, weekRes, monthRes, allTimeRes] = await Promise.all([
        logisticsApi.getEarnings(todayStart.toISOString(), now.toISOString()),
        logisticsApi.getEarnings(weekStart.toISOString(), now.toISOString()),
        logisticsApi.getEarnings(monthStart.toISOString(), now.toISOString()),
        logisticsApi.getEarnings(),
      ]);

      if (todayRes.success) setTodayEarnings(todayRes.data as EarningsData);
      if (weekRes.success) setWeekEarnings(weekRes.data as EarningsData);
      if (monthRes.success) setMonthEarnings(monthRes.data as EarningsData);
      if (allTimeRes.success) setAllTimeEarnings(allTimeRes.data as EarningsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch earnings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    try {
      setIsWithdrawing(true);
      setWithdrawalError('');
      setWithdrawalSuccess('');

      const amount = parseFloat(withdrawalAmount);
      if (isNaN(amount) || amount <= 0) {
        setWithdrawalError('Please enter a valid amount');
        return;
      }

      const response = await logisticsApi.requestWithdrawal({ amount });

      if (response.success) {
        setWithdrawalSuccess(
          response.message || 'Withdrawal request submitted successfully!'
        );
        setWithdrawalAmount('');
        setShowWithdrawal(false);
        // Refresh earnings data
        await fetchAllEarnings();
      } else {
        setWithdrawalError(response.error || 'Failed to request withdrawal');
      }
    } catch (err) {
      setWithdrawalError(err instanceof Error ? err.message : 'Failed to request withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-sm sm:text-base text-gray-500">Loading earnings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-2">Failed to load earnings</div>
          <div className="text-sm text-gray-600">{error}</div>
          <button
            onClick={fetchAllEarnings}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Earnings</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Track your delivery earnings and manage withdrawals
        </p>
      </div>

      {/* Withdrawal Success Message */}
      {withdrawalSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-2">
          <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm sm:text-base">{withdrawalSuccess}</span>
        </div>
      )}

      {/* Balance Summary Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 sm:p-8 mb-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-6 h-6" />
          <h2 className="text-lg sm:text-xl font-semibold">Available Balance</h2>
        </div>
        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          ₹{allTimeEarnings?.summary.pendingBalance.toFixed(2) || '0.00'}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-green-100 text-xs sm:text-sm">Total Earned</div>
            <div className="text-lg sm:text-xl font-semibold">
              ₹{allTimeEarnings?.summary.totalEarnings.toFixed(2) || '0.00'}
            </div>
          </div>
          <div>
            <div className="text-green-100 text-xs sm:text-sm">Withdrawn</div>
            <div className="text-lg sm:text-xl font-semibold">
              ₹{allTimeEarnings?.summary.totalWithdrawn.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowWithdrawal(!showWithdrawal)}
          className="w-full bg-white text-green-600 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowUpRight className="w-5 h-5" />
          <span>Request Withdrawal</span>
        </button>
      </div>

      {/* Withdrawal Form */}
      {showWithdrawal && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Request Withdrawal</h3>
          {withdrawalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {withdrawalError}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                Available: ₹{allTimeEarnings?.summary.pendingBalance.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowWithdrawal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawal}
                disabled={isWithdrawing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {isWithdrawing ? 'Processing...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Today's Earnings */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Today</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ₹{todayEarnings?.summary.totalEarnings.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            {todayEarnings?.earnings.length || 0} deliveries
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Last 7 Days</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ₹{weekEarnings?.summary.totalEarnings.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            {weekEarnings?.earnings.length || 0} deliveries
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Last 30 Days</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ₹{monthEarnings?.summary.totalEarnings.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            {monthEarnings?.earnings.length || 0} deliveries
          </div>
        </div>

        {/* All Time Stats */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sm:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">All Time Stats</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Deliveries</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {allTimeEarnings?.summary.totalDeliveries || 0}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Earned</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                ₹{allTimeEarnings?.summary.totalEarnings.toFixed(2) || '0.00'}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Avg per Delivery</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                ₹
                {allTimeEarnings?.summary.totalDeliveries
                  ? (
                      allTimeEarnings.summary.totalEarnings /
                      allTimeEarnings.summary.totalDeliveries
                    ).toFixed(2)
                  : '0.00'}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Balance</div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                ₹{allTimeEarnings?.summary.pendingBalance.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earnings History */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4">Recent Earnings</h3>
        {allTimeEarnings?.earnings && allTimeEarnings.earnings.length > 0 ? (
          <div className="space-y-3">
            {allTimeEarnings.earnings.slice(0, 10).map((earning) => (
              <div
                key={earning.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base font-medium text-gray-900">
                      Order #{earning.orderId.slice(-8)}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatDate(earning.createdAt)} • {earning.distance.toFixed(2)} km
                  </div>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    ₹{earning.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm sm:text-base">No earnings yet</p>
            <p className="text-xs sm:text-sm mt-1">
              Start accepting deliveries to earn money
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
