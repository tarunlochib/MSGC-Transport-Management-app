import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import DashboardOverview from './DashboardOverview';
import DashboardQuickActions from './DashboardQuickActions';
import DashboardAlerts from './DashboardAlerts';
import DashboardCharts from './DashboardCharts';
import DashboardStats from './DashboardStats';
import TransporterWeightContribution from './TransporterWeightContribution';
import GodownWeightTable from './GodownWeightTable';
import CustomerOverview from './CustomerOverview';
import StockExceptionsAlert from './StockExceptionsAlert';
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
    customers: [],
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
  const [transporters, setTransporters] = useState(null);
  const [challans, setChallans] = useState(null);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);

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
      } else {
        // Show subtle background refresh indicator
        setIsBackgroundRefreshing(true);
      }

      // Use original API calls (temporarily reverted for debugging)
      const [bookings, expenses, vehicles, transporters, drivers, customers, income, challans] = await Promise.all([
        api.get('/bookings'),
        api.get('/expenses'),
        api.get('/vehicles'),
        api.get('/transporters'),
        api.get('/drivers'),
        api.get('/customers'),
        api.get('/income'),
        api.get('/challans')
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
            const dailyRevenue = commissionAmount + localCartage;
            
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
        
        // Filter data for current month only
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

        // Get all active vehicles (not filtered by month)
        const allActiveVehicles = vehicles.data.filter(vehicle => vehicle.status === 'Active');
        
        // For percentage calculation, we need to compare current active vehicles vs previous month's active vehicles
        // But since we don't have historical status data, we'll show the current count without percentage change
        const currentMonthVehicles = vehicles.data.filter(vehicle => {
          const vehicleDate = new Date(vehicle.createdAt);
          return vehicleDate.getMonth() === currentMonth && vehicleDate.getFullYear() === currentYear;
        });

        // Filter drivers for current month only
        const currentMonthDrivers = drivers.data.filter(driver => {
          const driverDate = new Date(driver.createdAt);
          return driverDate.getMonth() === currentMonth && driverDate.getFullYear() === currentYear;
        });

        // Filter customers for current month only
        const currentMonthCustomers = customers.data.filter(customer => {
          const customerDate = new Date(customer.createdAt);
          return customerDate.getMonth() === currentMonth && customerDate.getFullYear() === currentYear;
        });

        // Filter transporters for current month only
        const currentMonthTransporters = transporters.data.filter(transporter => {
          const transporterDate = new Date(transporter.createdAt);
          return transporterDate.getMonth() === currentMonth && transporterDate.getFullYear() === currentYear;
        });

        const bookingsChange = previousMonthBookings.length > 0 
          ? ((currentMonthBookings.length - previousMonthBookings.length) / previousMonthBookings.length) * 100
          : currentMonthBookings.length > 0 ? 100 : 0; // Show 100% increase if we have current bookings but no previous
        
        const expensesChange = previousMonthExpenses.length > 0
          ? ((currentMonthExpenses.length - previousMonthExpenses.length) / previousMonthExpenses.length) * 100
          : 0;

        // Calculate previous month revenue
        const previousMonthRevenue = previousMonthBookings.reduce((sum, booking) => {
          const transporter = transporters.data.find(t => t.id === booking.transporterId);
          const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
          const localCartage = booking.localCartageCharges || 0;
          return sum + commissionAmount + localCartage;
        }, 0);

        const revenueChange = previousMonthRevenue > 0
          ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
          : totalRevenue > 0 ? 100 : 0; // Show 100% increase if we have current revenue but no previous

        // Calculate income change (current month vs previous month)
        const currentMonthIncome = income.data.data ? income.data.data.filter(inc => {
          const incomeDate = new Date(inc.date);
          return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
        }) : [];

        const previousMonthIncome = income.data.data ? income.data.data.filter(inc => {
          const incomeDate = new Date(inc.date);
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return incomeDate.getMonth() === prevMonth && incomeDate.getFullYear() === prevYear;
        }) : [];

        const currentMonthIncomeTotal = currentMonthIncome.reduce((sum, inc) => sum + (inc.amount || 0), 0);
        const previousMonthIncomeTotal = previousMonthIncome.reduce((sum, inc) => sum + (inc.amount || 0), 0);

        const incomeChange = previousMonthIncomeTotal > 0
          ? ((currentMonthIncomeTotal - previousMonthIncomeTotal) / previousMonthIncomeTotal) * 100
          : currentMonthIncomeTotal > 0 ? 100 : 0; // Show 100% increase if we have current income but no previous

        // Calculate weight change (current month vs previous month)
        const currentMonthWeight = currentMonthBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
        const previousMonthWeight = previousMonthBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
        
        const weightChange = previousMonthWeight > 0
          ? ((currentMonthWeight - previousMonthWeight) / previousMonthWeight) * 100
          : currentMonthWeight > 0 ? 100 : 0; // Show 100% increase if we have current weight but no previous

        // Calculate today's metrics
        const todayDate = new Date();
        const todayStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const todayEnd = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() + 1);

        // Today's bookings
        const todayBookings = bookings.data.filter(booking => {
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate >= todayStart && bookingDate < todayEnd;
        });

        // Today's weight
        const todayWeight = todayBookings.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);

        // Today's revenue (commission + local cartage from today's bookings)
        const todayRevenue = todayBookings.reduce((sum, booking) => {
          const transporter = transporters.data.find(t => t.id === booking.transporterId);
          const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
          const localCartage = booking.localCartageCharges || 0;
          return sum + commissionAmount + localCartage;
        }, 0);

        // Today's expenses
        const todayExpenses = expenses.data.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= todayStart && expenseDate < todayEnd;
        });
        const todayExpensesTotal = todayExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        // Today's income
        const todayIncome = income.data.data ? income.data.data.filter(inc => {
          const incomeDate = new Date(inc.date);
          return incomeDate >= todayStart && incomeDate < todayEnd;
        }) : [];
        const todayIncomeTotal = todayIncome.reduce((sum, inc) => sum + (inc.amount || 0), 0);

        // Calculate pending payments change
        const currentMonthPendingPayments = currentMonthBookings.reduce((sum, booking) => {
          const transporter = transporters.data.find(t => t.id === booking.transporterId);
          const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
          const localCartage = booking.localCartageCharges || 0;
          
          if (booking.paymentMethod?.toLowerCase() !== 'paid') {
            return sum + commissionAmount + localCartage;
          }
          return sum;
        }, 0);

        const previousMonthPendingPayments = previousMonthBookings.reduce((sum, booking) => {
          const transporter = transporters.data.find(t => t.id === booking.transporterId);
          const commissionAmount = (booking.weightKg || 0) * (transporter?.commissionRate || 0);
          const localCartage = booking.localCartageCharges || 0;
          
          if (booking.paymentMethod?.toLowerCase() !== 'paid') {
            return sum + commissionAmount + localCartage;
          }
          return sum;
        }, 0);

      const pendingPaymentsChange = previousMonthPendingPayments > 0
        ? ((currentMonthPendingPayments - previousMonthPendingPayments) / previousMonthPendingPayments) * 100
        : 0;

        // Calculate previous month data for comparison
        const previousMonthVehicles = vehicles.data.filter(v => {
          const vehicleDate = new Date(v.createdAt);
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return vehicleDate.getMonth() === prevMonth && vehicleDate.getFullYear() === prevYear;
        });

        // For vehicles, we don't have historical status data, so we'll show 0% change
        // The count will show current active vehicles, but no percentage change
        const vehiclesChange = 0; // No percentage change for active vehicles since we don't have historical status data

        const previousMonthDrivers = drivers.data.filter(d => {
          const driverDate = new Date(d.createdAt);
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return driverDate.getMonth() === prevMonth && driverDate.getFullYear() === prevYear;
        });

        // For drivers, we don't have historical status data, so we'll show 0% change
        // The count will show current active drivers, but no percentage change
        const driversChange = 0; // No percentage change for active drivers since we don't have historical status data

        const previousMonthCustomers = customers.data.filter(c => {
          const customerDate = new Date(c.createdAt);
          const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return customerDate.getMonth() === prevMonth && customerDate.getFullYear() === prevYear;
        });

      const customersChange = previousMonthCustomers.length > 0
        ? ((currentMonthCustomers.length - previousMonthCustomers.length) / previousMonthCustomers.length) * 100
        : currentMonthCustomers.length > 0 ? 100 : 0; // Show 100% increase if we have current customers but no previous

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

        if (allActiveVehicles.length < 5) {
          generatedAlerts.push({
            id: 'low-vehicles',
            title: 'Low Active Vehicles',
            message: `Only ${allActiveVehicles.length} active vehicles available.`,
            type: 'warning',
            timestamp: new Date().toISOString()
          });
        }

        if (currentMonthBookings.filter(b => b.status === 'pending').length > 10) {
          generatedAlerts.push({
            id: 'pending-bookings',
            title: 'Multiple Pending Bookings',
            message: 'Several bookings are pending approval. Please review them.',
            type: 'warning',
            timestamp: new Date().toISOString()
          });
        }

        setAlerts(generatedAlerts);

        // Store transporters data for the weight contribution component
        setTransporters(transporters);
      
        // Store challans data for the godown weight table
        setChallans(challans);

        const totalIncome = income.data.data ? income.data.data.reduce((sum, inc) => sum + (inc.amount || 0), 0) : 0;
             
             // Calculate total weight from all bookings
             const totalWeight = bookings.data.reduce((sum, booking) => sum + (booking.weightKg || 0), 0);
             
             setDashboardData({
         totalRevenue,
         totalIncome,
         totalBookings: currentMonthBookings.length,
         totalWeight,
         // Today's metrics
         todayWeight,
         todayRevenue,
         todayExpenses: todayExpensesTotal,
         todayBookings: todayBookings.length,
         todayIncome: todayIncomeTotal,
         allBookings: bookings.data, // Store all bookings for charts
         recentBookings: bookings.data
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
           .slice(0, 5),
         allExpenses: expenses.data, // Store all expenses for charts
         recentExpenses: expenses.data
           .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
           .slice(0, 5),
         customers: customers.data, // Store all customers for customer overview
         monthlyRevenueData, // Monthly revenue (commission + local cartage) for charts
         monthlyExpensesData, // Monthly expenses for charts
         dailyRevenueData, // Daily revenue (commission + local cartage) for daily charts
         dailyExpensesData, // Daily expenses for daily charts
         revenueChange,
         bookingsChange,
         expensesChange,
         weightChange,
         pendingPaymentsChange,
                  stats: {
            revenue: totalRevenue, // This is now commission earnings only
            income: income.data.data ? income.data.data.reduce((sum, inc) => sum + (inc.amount || 0), 0) : 0,
            pendingPayments,
            bookings: currentMonthBookings.length, // Current month bookings only
            vehicles: allActiveVehicles.length, // All active vehicles (not filtered by month)
            drivers: drivers.data.filter(d => d.status === 'Active').length, // All active drivers (not filtered by month)
            customers: currentMonthCustomers.length, // Current month customers only
            transporters: currentMonthTransporters.length, // Current month transporters only
            expenses: currentMonthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0), // Current month expenses only
            // Today's metrics
            todayWeight,
            todayRevenue,
            todayExpenses: todayExpensesTotal,
            todayBookings: todayBookings.length,
            todayIncome: todayIncomeTotal,
            // Add percentage changes
            revenueChange,
            incomeChange,
            pendingPaymentsChange,
            bookingsChange,
            weightChange,
            driversChange,
            customersChange
          }
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
        setIsBackgroundRefreshing(false);
      }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds - only refresh data, don't show loading
    const interval = setInterval(() => {
      fetchDashboardData(false); // Pass false to not show loading spinner
    }, 30000);
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
        {/* Background Refresh Indicator */}
        {isBackgroundRefreshing && (
          <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium">Refreshing data...</span>
          </div>
        )}
        
        {/* Header */}
        <DashboardHeader apiStatus={apiStatus} error={error} />
        
        {/* Alerts - Compact */}
        {alerts.length > 0 && (
          <div className="mb-4">
            <DashboardAlerts alerts={alerts} />
          </div>
        )}
        
        {/* Stock Exceptions Alert - MOST IMPORTANT */}
        <div className="mb-6">
          <StockExceptionsAlert />
        </div>

        {/* Overview Cards - Key Metrics */}
        <div className="mb-6">
          <DashboardOverview 
            data={dashboardData}
            loading={loading}
          />
        </div>

        {/* Godown Weight Table - Current Inventory Status */}
        <div className="mb-6">
          <GodownWeightTable 
            transporters={transporters?.data || []}
            bookings={dashboardData.allBookings}
            challans={challans?.data || []}
            loading={loading}
          />
        </div>
        
        {/* Transporter Weight Contribution - Performance Metrics */}
        <div className="mb-6">
          <TransporterWeightContribution 
            transporters={transporters?.data || []}
            bookings={dashboardData.allBookings}
            loading={loading}
          />
        </div>

        {/* Analytics & Insights Section */}
        <div className="space-y-6">
          {/* Charts - Historical Trends & Analytics */}
          <div className="mb-6">
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

          {/* Secondary Information Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Customer Overview - Business Insights */}
            <div className="xl:col-span-2">
              <CustomerOverview 
                bookings={dashboardData.allBookings}
                customers={dashboardData.customers}
                loading={loading}
              />
            </div>
            
            {/* Quick Actions & Stats - Secondary Actions */}
            <div className="xl:col-span-1 space-y-6">
              <DashboardQuickActions />
              <DashboardStats 
                stats={dashboardData.stats}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 