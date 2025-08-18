import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardOverview from './DashboardOverview';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardAlerts from './DashboardAlerts';
import DashboardCharts from './DashboardCharts';
import DashboardStats from './DashboardStats';
import api from '../../utils/api';

const DashboardHome = () => {
     const [dashboardData, setDashboardData] = useState({
     totalRevenue: 0,
     pendingPayments: 0,
     totalBookings: 0,
     activeVehicles: 0,
     allBookings: [],
     recentBookings: [],
     allExpenses: [],
     recentExpenses: [],
     monthlyRevenueData: {},
     monthlyExpensesData: {},
     dailyRevenueData: {},
     dailyExpensesData: {},
     revenueChange: 0,
     bookingsChange: 0,
     expensesChange: 0,
     stats: {
       revenue: 0,
       pendingPayments: 0,
       bookings: 0,
       vehicles: 0,
       drivers: 0,
       customers: 0,
       transporters: 0,
       expenses: 0
     }
   });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('online');
  const [alerts, setAlerts] = useState([]);

     const refreshRecentData = async () => {
     try {
       const [bookings, expenses] = await Promise.all([
         api.get('/bookings'),
         api.get('/expenses')
       ]);

       // Update both all data and recent data for charts
       // Note: We need transporters data to calculate monthly revenue, so we'll skip monthly data in refresh
       setDashboardData(prev => ({
         ...prev,
         allBookings: bookings.data,
         recentBookings: bookings.data
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
           .slice(0, 5),
         allExpenses: expenses.data,
         recentExpenses: expenses.data
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
           .slice(0, 5)
       }));
     } catch (err) {
       console.error('Error refreshing recent data:', err);
     }
   };

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const [bookings, expenses, vehicles, transporters, drivers, customers] = await Promise.all([
        api.get('/bookings'),
        api.get('/expenses'),
        api.get('/vehicles'),
        api.get('/transporters'),
        api.get('/drivers'),
        api.get('/customers')
      ]);

                                  // Calculate total revenue from all bookings (commission + local cartage - your real earnings)
       const totalRevenue = bookings.data.reduce((sum, booking) => {
         const transporter = transporters.data.find(t => t.id === booking.transporterId);
         const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
         const localCartage = booking.localCartageCharges || 0;
         return sum + commissionAmount + localCartage;
       }, 0);

       // Calculate monthly revenue data (commission + local cartage) for charts
       const monthlyRevenueData = {};
       const monthlyExpensesData = {};
       
       // Initialize monthly data
       const currentDate = new Date();
       for (let i = 11; i >= 0; i--) {
         const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
         const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
         monthlyRevenueData[monthKey] = 0;
         monthlyExpensesData[monthKey] = 0;
       }
       
       // Calculate monthly revenue (commission + local cartage)
       bookings.data.forEach(booking => {
         const transporter = transporters.data.find(t => t.id === booking.transporterId);
         const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
         const localCartage = booking.localCartageCharges || 0;
         const monthlyRevenue = commissionAmount + localCartage;
         
         const bookingDate = new Date(booking.createdAt);
         const monthKey = bookingDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
         
         if (monthlyRevenueData.hasOwnProperty(monthKey)) {
           monthlyRevenueData[monthKey] += monthlyRevenue;
         }
       });
       
       // Calculate monthly expenses
       expenses.data.forEach(expense => {
         const expenseDate = new Date(expense.createdAt);
         const monthKey = expenseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
         
         if (monthlyExpensesData.hasOwnProperty(monthKey)) {
           monthlyExpensesData[monthKey] += expense.amount || 0;
         }
       });

       // Calculate daily revenue data (commission + local cartage) for daily charts
       const dailyRevenueData = {};
       const dailyExpensesData = {};
       
       // Get current month for daily view
       const today = new Date();
       const todayMonth = today.getMonth();
       const todayYear = today.getFullYear();
       
       // Calculate daily revenue for current month
       bookings.data.forEach(booking => {
         const bookingDate = new Date(booking.createdAt);
         if (bookingDate.getMonth() === todayMonth && bookingDate.getFullYear() === todayYear) {
           const day = bookingDate.getDate();
           const transporter = transporters.data.find(t => t.id === booking.transporterId);
           const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
           const localCartage = booking.localCartageCharges || 0;
           const dailyRevenue = commissionAmount + localCartage; // Your actual earnings
           
           if (!dailyRevenueData[day]) {
             dailyRevenueData[day] = 0;
           }
           dailyRevenueData[day] += dailyRevenue;
         }
       });
       
       // Calculate daily expenses for current month
       expenses.data.forEach(expense => {
         const expenseDate = new Date(expense.createdAt);
         if (expenseDate.getMonth() === todayMonth && expenseDate.getFullYear() === todayYear) {
           const day = expenseDate.getDate();
           
           if (!dailyExpensesData[day]) {
             dailyExpensesData[day] = 0;
           }
           dailyExpensesData[day] += expense.amount || 0;
         }
       });

                           // Calculate pending payments (only from unpaid bookings - commission + local cartage)
        const pendingPayments = bookings.data.reduce((sum, booking) => {
          const transporter = transporters.data.find(t => t.id === booking.transporterId);
          const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
          const localCartage = booking.localCartageCharges || 0;
          
          if (booking.paymentMethod?.toLowerCase() !== 'paid') {
            return sum + commissionAmount + localCartage;
          }
          return sum;
        }, 0);

      // Calculate percentage changes (current month vs previous month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const currentMonthBookings = bookings.data.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      });
      
      const previousMonthBookings = bookings.data.filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return bookingDate.getMonth() === prevMonth && bookingDate.getFullYear() === prevYear;
      });

      const currentMonthExpenses = expenses.data.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });
      
      const previousMonthExpenses = expenses.data.filter(expense => {
        const expenseDate = new Date(expense.createdAt);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return expenseDate.getMonth() === prevMonth && expenseDate.getFullYear() === prevYear;
      });

      const bookingsChange = previousMonthBookings.length > 0 
        ? ((currentMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length) * 100
        : 0;
      
      const expensesChange = previousMonthExpenses.length > 0
        ? ((currentMonthExpenses.length - previousMonthExpenses.length) / previousMonthExpenses.length) * 100
        : 0;

                           const revenueChange = previousMonthBookings.length > 0
          ? ((totalRevenue - (previousMonthBookings.reduce((sum, booking) => {
              const transporter = transporters.data.find(t => t.id === booking.transporterId);
              const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
              const localCartage = booking.localCartageCharges || 0;
              return sum + commissionAmount + localCartage;
            }, 0))) / previousMonthBookings.length) * 100
          : 0;

      // Generate alerts based on data
      const generatedAlerts = [];
      
      if (pendingPayments > 100000) {
        generatedAlerts.push({
          id: 'high-pending',
          title: 'High Pending Payments',
          message: `₹${pendingPayments.toLocaleString()} in pending payments requires attention.`,
          type: 'warning',
          timestamp: new Date().toISOString()
        });
      }

      if (vehicles.data.filter(v => v.status === 'active').length < 5) {
        generatedAlerts.push({
          id: 'low-vehicles',
          title: 'Low Active Vehicles',
          message: 'Only a few vehicles are currently active. Consider adding more vehicles.',
          type: 'info',
          timestamp: new Date().toISOString()
        });
      }

      if (bookings.data.filter(b => b.status === 'pending').length > 10) {
        generatedAlerts.push({
          id: 'pending-bookings',
          title: 'Multiple Pending Bookings',
          message: 'Several bookings are pending approval. Please review them.',
          type: 'warning',
          timestamp: new Date().toISOString()
        });
      }

      setAlerts(generatedAlerts);

             setDashboardData({
         totalRevenue,
         pendingPayments,
         totalBookings: bookings.data.length,
         activeVehicles: vehicles.data.filter(v => v.status === 'active').length,
         allBookings: bookings.data, // Store all bookings for charts
         recentBookings: bookings.data
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
           .slice(0, 5),
         allExpenses: expenses.data, // Store all expenses for charts
         recentExpenses: expenses.data
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
           .slice(0, 5),
         monthlyRevenueData, // Monthly revenue (commission + local cartage) for charts
         monthlyExpensesData, // Monthly expenses for charts
         dailyRevenueData, // Daily revenue (commission + local cartage) for daily charts
         dailyExpensesData, // Daily expenses for daily charts
         revenueChange,
         bookingsChange,
         expensesChange,
                  stats: {
            revenue: totalRevenue, // This is now commission earnings only
            pendingPayments,
            bookings: bookings.data.length,
            vehicles: vehicles.data.filter(v => v.status === 'active').length,
            drivers: drivers.data.filter(d => d.status === 'active').length,
            customers: customers.data.length,
            transporters: transporters.data.filter(t => t.status === 'active').length,
            expenses: expenses.data.reduce((sum, exp) => sum + (exp.amount || 0), 0)
          }
        });

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <DashboardHeader apiStatus={apiStatus} error={error} />
        
        {/* Alerts - Compact */}
        {alerts.length > 0 && (
          <div className="mb-4">
            <DashboardAlerts alerts={alerts} />
          </div>
        )}
        
        {/* Overview Cards */}
        <div className="mb-6">
          <DashboardOverview 
            data={dashboardData}
            loading={loading}
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Quick Actions - Compact */}
          <div className="xl:col-span-1">
            <DashboardQuickActions />
          </div>
          
          {/* Charts - Main Focus */}
          <div className="xl:col-span-2">
                         <DashboardCharts 
               recentBookings={dashboardData.recentBookings}
               recentExpenses={dashboardData.recentExpenses}
               loading={loading}
               onRefresh={refreshRecentData}
               totalRevenue={dashboardData.totalRevenue}
               allBookings={dashboardData.allBookings}
               allExpenses={dashboardData.allExpenses}
               monthlyRevenueData={dashboardData.monthlyRevenueData}
               monthlyExpensesData={dashboardData.monthlyExpensesData}
               dailyRevenueData={dashboardData.dailyRevenueData}
               dailyExpensesData={dashboardData.dailyExpensesData}
             />
          </div>
          
          {/* Stats - Compact */}
          <div className="xl:col-span-1">
            <DashboardStats 
              stats={dashboardData.stats}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 