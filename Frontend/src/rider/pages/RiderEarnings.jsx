// ============================================
// Frontend/src/rider/pages/RiderEarnings.jsx
// ✅ PRODUCTION READY - Full Backend Integration
// ============================================
import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Loader,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  RefreshCw,
  Copy,
  Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import riderApi from '../../api/rider.api';
import { formatDate, getPeriodLabel } from '../utils/dateUtils';
// import { exportEarningsToCSV, copyToClipboard, printEarningsReport } from '../../utils/exportUtils';

const RiderEarnings = () => {
  const [earnings, setEarnings] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [period, setPeriod] = useState('today');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      console.log('📊 Fetching earnings for period:', period);
      
      const response = await riderApi.getEarnings(period);
      console.log('✅ Earnings response:', response);
      
      // Handle nested data structure from backend
      const data = response.data || response;
      
      setEarnings(data.summary || {
        total: 0,
        pending: 0,
        paid: 0,
        thisWeek: 0,
        thisMonth: 0
      });
      
      setHistory(data.earnings || []);
      
      if (data.pagination) {
        setPagination(data.pagination);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch earnings:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load earnings';
      toast.error(errorMsg);
      
      // Set empty data on error
      setEarnings({
        total: 0,
        pending: 0,
        paid: 0,
        thisWeek: 0,
        thisMonth: 0
      });
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings(false);
    toast.success('Earnings refreshed!');
  };

  const handleExport = async () => {
    if (history.length === 0) {
      toast.error('No earnings data to export');
      return;
    }

    try {
      setExporting(true);
      exportEarningsToCSV(history, period);
      toast.success('Earnings exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export earnings');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (history.length === 0) {
      toast.error('No earnings data to copy');
      return;
    }

    try {
      const columns = [
        { key: 'date', label: 'Date' },
        { key: 'type', label: 'Type' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' }
      ];

      const formattedData = history.map(item => ({
        date: formatDate(item.date, 'full'),
        type: item.type || 'Delivery',
        amount: `Rs. ${item.amount}`,
        status: item.status?.toUpperCase() || 'PENDING'
      }));

      await copyToClipboard(formattedData, columns);
      toast.success('Earnings copied to clipboard!');
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const handlePrint = () => {
    if (history.length === 0) {
      toast.error('No earnings data to print');
      return;
    }

    try {
      printEarningsReport(earnings, history);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print report');
    }
  };

  const getEarningTypeColor = (type) => {
    const colors = {
      delivery: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      bonus: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      tip: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      incentive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[type] || colors.delivery;
  };

  const getStatusIcon = (status) => {
    if (status === 'paid') {
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    return <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">Earnings</h1>
              <p className="text-green-100">Track your delivery earnings</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
            </button>
          </div>
          
          {/* Period Label */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <Calendar size={16} />
            <span className="text-sm font-medium">{getPeriodLabel(period)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Earnings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              Rs. {earnings.total?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              All time earnings
            </p>
          </div>

          {/* Pending */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                <Clock className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              Rs. {earnings.pending?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Awaiting payment
            </p>
          </div>

          {/* This Week */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">This Week</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Rs. {earnings.thisWeek?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Last 7 days
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {['today', 'week', 'month', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                disabled={refreshing}
                className={`flex-1 min-w-[100px] py-2.5 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                  period === p
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Earnings History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          {/* Header with Actions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Earnings History
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {history.length} transaction{history.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              {history.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                  
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {exporting ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                    Export CSV
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* History List */}
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-gray-400 dark:text-gray-500" size={40} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No earnings yet
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                {period === 'today' 
                  ? "Complete deliveries today to see your earnings here"
                  : `No earnings for ${getPeriodLabel(period).toLowerCase()}`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((item, index) => (
                <div 
                  key={item._id || index} 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    {/* Left Side */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getEarningTypeColor(item.type)}`}>
                          {item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || 'Delivery'}
                        </span>
                        {getStatusIcon(item.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(item.date, 'full')}
                      </p>
                      {item.orderId && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Order: {item.orderId._id?.slice(-8) || item.orderId}
                        </p>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        + Rs. {item.amount?.toLocaleString() || 0}
                      </p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full font-semibold mt-1 ${
                        item.status === 'paid' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {item.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Info */}
          {pagination.total > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Showing {history.length} of {pagination.total} transactions
              </p>
            </div>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* This Month */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                This Month
              </h4>
              <Calendar className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              Rs. {earnings.thisMonth?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Monthly earnings
            </p>
          </div>

          {/* Paid Out */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Paid Out
              </h4>
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              Rs. {earnings.paid?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Successfully transferred
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderEarnings;