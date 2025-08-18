import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AuthPage from './components/AuthPage';
import SignupPage from './components/SignupPage';
import { useAuth } from './context/AuthContext';

// Import pages
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import CustomersPage from './pages/CustomersPage';
import TransportersPage from './pages/TransportersPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import ExpensesPage from './pages/ExpensesPage';
import BillingPage from './pages/BillingPage';

// Import individual components for CRUD operations
import CreateBookingPage from './components/bookings/CreateBookingPage';
import EditBookingPage from './components/bookings/EditBookingPage';
import ViewBookingPage from './components/bookings/ViewBookingPage';

import CreateCustomerPage from './components/customers/CreateCustomerPage';
import EditCustomerPage from './components/customers/EditCustomerPage';
import ViewCustomerPage from './components/customers/ViewCustomerPage';

import CreateTransporterPage from './components/transporters/CreateTransporterPage';
import EditTransporterPage from './components/transporters/EditTransporterPage';
import ViewTransporterPage from './components/transporters/ViewTransporterPage';

import CreateVehiclePage from './components/vehicles/CreateVehiclePage';
import EditVehiclePage from './components/vehicles/EditVehiclePage';
import ViewVehiclePage from './components/vehicles/ViewVehiclePage';

import CreateDriverPage from './components/drivers/CreateDriverPage';
import EditDriverPage from './components/drivers/EditDriverPage';
import ViewDriverPage from './components/drivers/ViewDriverPage';

// Import challan components
import ChallansListPage from './components/challans/ChallansListPage';
import CreateChallanPage from './components/challans/CreateChallanPage';
import ChallanDetailsPage from './components/challans/ChallanDetailsPage';

function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />
        } />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                {/* Dashboard */}
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Bookings */}
                <Route path="/bookings/create" element={<CreateBookingPage />} />
                <Route path="/bookings/:id/edit" element={<EditBookingPage />} />
                <Route path="/bookings/:id" element={<ViewBookingPage />} />
                <Route path="/bookings" element={<BookingsPage />} />
                
                {/* Customers */}
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/create" element={<CreateCustomerPage />} />
                <Route path="/customers/:id" element={<ViewCustomerPage />} />
                <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
                
                {/* Transporters */}
                <Route path="/transporters" element={<TransportersPage />} />
                <Route path="/transporters/create" element={<CreateTransporterPage />} />
                <Route path="/transporters/:id" element={<ViewTransporterPage />} />
                <Route path="/transporters/:id/edit" element={<EditTransporterPage />} />
                
                {/* Vehicles */}
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/vehicles/create" element={<CreateVehiclePage />} />
                <Route path="/vehicles/:id" element={<ViewVehiclePage />} />
                <Route path="/vehicles/:id/edit" element={<EditVehiclePage />} />
                
                {/* Drivers */}
                <Route path="/drivers" element={<DriversPage />} />
                <Route path="/drivers/create" element={<CreateDriverPage />} />
                <Route path="/drivers/:id" element={<ViewDriverPage />} />
                <Route path="/drivers/:id/edit" element={<EditDriverPage />} />
                
                {/* Expenses */}
                <Route path="/expenses" element={<ExpensesPage />} />
                
                {/* Billing */}
                <Route path="/billing" element={<BillingPage />} />
                
                {/* Challans */}
                <Route path="/challans" element={<ChallansListPage />} />
                <Route path="/challans/create" element={<CreateChallanPage />} />
                <Route path="/challans/:id" element={<ChallanDetailsPage />} />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App; 