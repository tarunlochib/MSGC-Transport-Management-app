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
    pendingBills: 0,
    totalWeight: 0,
    averageCommission: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingStats();
  }, []);

  const fetchBillingStats = async () => {
    try {
      setLoading(true);
      // Fetch billing statistics
      const [transporters, bookings] = await Promise.all([
        axios.get('/api/transporters'),
        axios.get('/api/bookings')
      ]);

      // Calculate billing statistics
      let totalCommission = 0;
      let totalWeight = 0;
      let totalBookings = 0;

      transporters.data.forEach(transporter => {
        const transporterBookings = bookings.data.filter(
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

      setBillingStats({
        totalCommission,
        pendingBills: bookings.data.filter(b => b.paymentMethod !== 'Paid').length,
        totalWeight,
        averageCommission
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