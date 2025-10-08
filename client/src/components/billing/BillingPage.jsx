import { useState, useEffect } from 'react';
import axios from 'axios';

// Import billing components
import BillingHeader from './BillingHeader';
import BillingStats from './BillingStats';
import BillingCalculator from './BillingCalculator';
import BillGenerator from './BillGenerator';

const BillingPage = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [billingStats, setBillingStats] = useState({
    totalCommission: 0,
    totalBookings: 0,
    totalWeight: 0,
    averageCommission: 0,
    prevTotalCommission: 0,
    prevTotalBookings: 0,
    prevTotalWeight: 0,
    prevAverageCommission: 0
  });
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingStats();
  }, [selectedMonth, selectedYear]);

  const fetchBillingStats = async () => {
    try {
      setLoading(true);
      // Fetch billing statistics
      const [transporters, bookings] = await Promise.all([
        axios.get('/api/transporters'),
        axios.get('/api/bookings')
      ]);

      // Filter bookings for selected month/year
      const monthFilteredBookings = bookings.data.filter(b => {
        const d = new Date(b.bookingDate || b.createdAt);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });

      // Calculate billing statistics for selected period
      let totalCommission = 0;
      let totalWeight = 0;
      let totalBookings = 0;

      transporters.data.forEach(transporter => {
        const transporterBookings = monthFilteredBookings.filter(
          booking => booking.transporterId === transporter.id
        );

        const weight = transporterBookings.reduce(
          (sum, booking) => sum + (booking.weightKg || 0), 0
        );

        const commission = weight * (transporter.commissionRate || 0);
        
        totalCommission += commission;
        totalWeight += weight;
        totalBookings += transporterBookings.length;
      });

      const averageCommission = totalBookings > 0 ? totalCommission / totalBookings : 0;

      // Previous period (previous month)
      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const prevMonthBookings = bookings.data.filter(b => {
        const d = new Date(b.bookingDate || b.createdAt);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });

      let prevTotalCommission = 0;
      let prevTotalWeight = 0;
      let prevTotalBookings = 0;

      transporters.data.forEach(transporter => {
        const transporterPrevBookings = prevMonthBookings.filter(
          booking => booking.transporterId === transporter.id
        );

        const weightPrev = transporterPrevBookings.reduce(
          (sum, booking) => sum + (booking.weightKg || 0), 0
        );
        const commissionPrev = weightPrev * (transporter.commissionRate || 0);

        prevTotalCommission += commissionPrev;
        prevTotalWeight += weightPrev;
        prevTotalBookings += transporterPrevBookings.length;
      });

      const prevAverageCommission = prevTotalBookings > 0 ? prevTotalCommission / prevTotalBookings : 0;

      setBillingStats({
        totalCommission,
        totalBookings,
        totalWeight,
        averageCommission,
        prevTotalCommission,
        prevTotalBookings,
        prevTotalWeight,
        prevAverageCommission
      });
    } catch (error) {
      console.error('Error fetching billing stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'calculator',
      name: 'Billing Calculator',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'generator',
      name: 'Generate Bills',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="mb-6">
            <BillingHeader />
          </div>
          
          {/* Period Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 font-medium">Billing Summary</div>
            <div className="flex items-center space-x-3">
              {/* Month Selector */}
              <div className="relative">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="appearance-none pl-8 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                >
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <option key={idx} value={idx}>
                      {new Date(2000, idx, 1).toLocaleString('en-US', { month: 'short' })}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Year Selector */}
              <div className="relative">
                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="appearance-none pl-8 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors"
                >
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = now.getFullYear() - i;
                    return (
                      <option key={y} value={y}>{y}</option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <BillingStats stats={billingStats} loading={loading} />
          </div>
          
          {/* Tab Navigation */}
          <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
            <div className="bg-white rounded-lg shadow-md border border-gray-100">
              <div className="border-b border-gray-100">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`}>
                        {tab.icon}
                      </div>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'calculator' && (
                  <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                    <BillingCalculator />
                  </div>
                )}
                
                {activeTab === 'generator' && (
                  <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                    <BillGenerator />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage; 