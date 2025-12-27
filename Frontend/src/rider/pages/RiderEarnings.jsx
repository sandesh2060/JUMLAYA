// ============================================
// Frontend/src/rider/pages/RiderEarnings.jsx
// ============================================
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import riderAPI from '../utils/riderApi';

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
  const [period, setPeriod] = useState('today');

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const response = await riderAPI.getEarnings(period);
      setEarnings(response.summary || earnings);
      setHistory(response.earnings || []);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Earnings</h1>
          <p className="text-green-100">Track your delivery earnings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <span className="text-gray-600">Total Earnings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              Rs. {earnings.total?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <span className="text-gray-600">Pending</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              Rs. {earnings.pending?.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <span className="text-gray-600">This Week</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              Rs. {earnings.thisWeek?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2">
            {['today', 'week', 'month'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-lg font-semibold transition ${
                  period === p
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Earnings History */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-bold">Earnings History</h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download size={16} />
              Export
            </button>
          </div>
          
          {history.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">No earnings history for this period</p>
            </div>
          ) : (
            <div className="divide-y">
              {history.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || 'Delivery'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        + Rs. {item.amount?.toLocaleString() || 0}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderEarnings;