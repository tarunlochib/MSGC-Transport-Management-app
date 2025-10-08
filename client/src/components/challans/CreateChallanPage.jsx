import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import performanceOptimizer from '../../utils/performanceOptimization';
import { 
  ChallanCard, 
  FormField, 
  Button, 
  Alert, 
  StatsCard,
  ChallanHeader
} from './components';

const CreateChallanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    transportCompanyId: '',
    truckId: '',
    driverId: '',
    fromLocation: '',
    toLocation: '',
    notes: '',
    challanNumber: ''
  });

  // Filter data (separate from form data)
  const [filterData, setFilterData] = useState({
    fromLocation: '',
    toLocation: ''
  });

  // Available data
  const [transporters, setTransporters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  // Selected bookings for challan
  const [selectedBookings, setSelectedBookings] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.transportCompanyId) {
      fetchVehiclesAndDrivers();
      fetchAvailableBookings();
    }
  }, [formData.transportCompanyId]);

  useEffect(() => {
    filterBookings();
  }, [filterData, availableBookings]);

  const fetchInitialData = async () => {
    try {
      const [transportersRes] = await Promise.all([
        fetch('/api/transporters')
      ]);
      
      if (transportersRes.ok) {
        const transportersData = await transportersRes.json();
        setTransporters(transportersData);
      }
    } catch (err) {
      setError('Failed to fetch initial data');
    }
  };

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/drivers')
      ]);
      
      if (vehiclesRes.ok && driversRes.ok) {
        const [vehiclesData, driversData] = await Promise.all([
          vehiclesRes.json(),
          driversRes.json()
        ]);
        setVehicles(vehiclesData);
        setDrivers(driversData);
      }
    } catch (err) {
      console.error('Error fetching vehicles and drivers:', err);
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      const response = await fetch(`/api/challans/available-bookings?transporterId=${formData.transportCompanyId}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableBookings(data);
        setFilteredBookings(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch available bookings');
    }
  };

  const filterBookings = () => {
    let filtered = availableBookings || [];
    
    if (filterData.fromLocation) {
      filtered = filtered.filter(booking => 
        booking.destinationLocation.toLowerCase().includes(filterData.fromLocation.toLowerCase())
      );
    }
    
    if (filterData.toLocation) {
      filtered = filtered.filter(booking => 
        booking.destinationLocation.toLowerCase().includes(filterData.toLocation.toLowerCase())
      );
    }
    
    setFilteredBookings(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleBookingSelection = (booking) => {
    setSelectedBookings(prev => {
      const isSelected = prev.some(b => b.id === booking.id);
      if (isSelected) {
        return prev.filter(b => b.id !== booking.id);
      } else {
        return [...prev, booking];
      }
    });
  };

  const removeSelectedBooking = (bookingId) => {
    setSelectedBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const clearFilters = () => {
    setFilterData({ fromLocation: '', toLocation: '' });
    setFilteredBookings(availableBookings || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedBookings.length === 0) {
      setError('Please select at least one GR to create challan');
      return;
    }

    if (!formData.transportCompanyId || !formData.truckId || !formData.driverId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const challanData = {
        ...formData,
        selectedBookings: selectedBookings.map(booking => booking.id)
      };

      const response = await fetch('/api/challans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(challanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create challan');
      }

      // Invalidate dashboard cache to ensure fresh data
      performanceOptimizer.clearCacheEntry('bookings');
      performanceOptimizer.clearCacheEntry('challans');
      
      setSuccess('Challan created successfully!');
      setTimeout(() => {
        navigate('/challans');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  const totalPackages = selectedBookings.reduce((sum, booking) => sum + (booking.packages || 0), 0);
  const totalWeight = selectedBookings.reduce((sum, booking) => sum + (booking.weight || 0), 0);
  const totalCharges = selectedBookings.reduce((sum, booking) => sum + (booking.charges || 0), 0);

  if (loading && !availableBookings.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div 
          className="mb-8"
          style={{
            animationDelay: '0ms',
            animation: isVisible ? 'slideInDown 0.6s ease-out forwards' : 'none'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Challan</h1>
                <p className="text-gray-600 mt-1">Generate challan for selected GRs with transport details</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/challans')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Challans</span>
            </button>
          </div>
        </div>

        {/* Error/Success Alerts */}
        {error && (
          <div 
            className="mb-6"
            style={{
              animationDelay: '100ms',
              animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
            }}
          >
            <Alert type="error" message={error} onClose={() => setError(null)} />
          </div>
        )}

        {success && (
          <div 
            className="mb-6"
            style={{
              animationDelay: '100ms',
              animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
            }}
          >
            <Alert type="success" message={success} onClose={() => setSuccess(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Form */}
            <div className="xl:col-span-2 space-y-6">
              {/* Challan Details Card */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: '200ms',
                  animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Challan Details</h3>
                      <p className="text-blue-100 text-sm">Enter transport and challan information</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Transport Company"
                      name="transportCompanyId"
                      value={formData.transportCompanyId}
                      onChange={handleFormChange}
                      required
                    >
                      <select
                        name="transportCompanyId"
                        value={formData.transportCompanyId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200"
                      >
                        <option value="">Select Transport Company</option>
                        {transporters.map(transporter => (
                          <option key={transporter.id} value={transporter.id}>
                            {transporter.name}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField
                      label="Challan Number"
                      name="challanNumber"
                      value={formData.challanNumber}
                      onChange={handleFormChange}
                      placeholder="Enter custom challan number (optional)"
                      helpText="Leave empty to auto-generate challan number"
                    />

                    <FormField
                      label="Truck/Vehicle"
                      name="truckId"
                      value={formData.truckId}
                      onChange={handleFormChange}
                      required
                    >
                      <select
                        name="truckId"
                        value={formData.truckId}
                        onChange={handleFormChange}
                        disabled={!formData.transportCompanyId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Vehicle</option>
                        {vehicles.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            Truck #{vehicle.vehicleNumber} - {vehicle.make} {vehicle.model}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField
                      label="Driver"
                      name="driverId"
                      value={formData.driverId}
                      onChange={handleFormChange}
                      required
                    >
                      <select
                        name="driverId"
                        value={formData.driverId}
                        onChange={handleFormChange}
                        disabled={!formData.transportCompanyId}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Driver</option>
                        {drivers.map(driver => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} - {driver.phone}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField
                      label="From Location"
                      name="fromLocation"
                      value={formData.fromLocation}
                      onChange={handleFormChange}
                      placeholder="Enter departure location"
                    />

                    <FormField
                      label="To Location"
                      name="toLocation"
                      value={formData.toLocation}
                      onChange={handleFormChange}
                      placeholder="Enter destination location"
                    />

                    <div className="md:col-span-2">
                      <FormField
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleFormChange}
                        placeholder="Additional notes (optional)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Available GRs Card */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: '300ms',
                  animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Available GRs</h3>
                        <p className="text-emerald-100 text-sm">Select GRs to include in this challan</p>
                      </div>
                    </div>
                    <div className="text-emerald-100 text-sm">
                      {filteredBookings.length} available
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {!formData.transportCompanyId ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Please select a transport company first to view available GRs</p>
                    </div>
                  ) : (
                    <>
                      {/* Compact Filters */}
                      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="flex flex-wrap gap-3 items-end">
                          <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by From Location</label>
                            <input
                              type="text"
                              name="fromLocation"
                              value={filterData.fromLocation}
                              onChange={handleFilterChange}
                              placeholder="Filter by departure location"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          <div className="flex-1 min-w-48">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by To Location</label>
                            <input
                              type="text"
                              name="toLocation"
                              value={filterData.toLocation}
                              onChange={handleFilterChange}
                              placeholder="Filter by destination location"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      {/* GRs List */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredBookings.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No available GRs found</p>
                          </div>
                        ) : (
                          filteredBookings.map((booking, index) => (
                            <div
                              key={booking.id}
                              className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                                selectedBookings.some(b => b.id === booking.id)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                              onClick={() => toggleBookingSelection(booking)}
                              style={{
                                animationDelay: `${400 + (index * 50)}ms`,
                                animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    selectedBookings.some(b => b.id === booking.id)
                                      ? 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {selectedBookings.some(b => b.id === booking.id) && (
                                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">GR: {booking.grNumber}</div>
                                    <div className="text-sm text-gray-600">{booking.destinationLocation}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-900">{booking.packages} packages</div>
                                  <div className="text-sm text-gray-600">{booking.weight} kg</div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="xl:col-span-1 space-y-6">
              {/* Selected GRs Summary */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: '400ms',
                  animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Selected GRs</h3>
                      <p className="text-purple-100 text-sm">{selectedBookings.length} GRs selected</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {selectedBookings.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">No GRs selected</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedBookings.map((booking, index) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          style={{
                            animationDelay: `${500 + (index * 50)}ms`,
                            animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                          }}
                        >
                          <div>
                            <div className="font-medium text-gray-900 text-sm">GR: {booking.grNumber}</div>
                            <div className="text-xs text-gray-600">{booking.destinationLocation}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedBooking(booking.id)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: '500ms',
                  animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Summary</h3>
                      <p className="text-orange-100 text-sm">Challan totals</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Packages</span>
                    <span className="font-semibold text-gray-900">{totalPackages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Weight</span>
                    <span className="font-semibold text-gray-900">{totalWeight} kg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Charges</span>
                    <span className="font-semibold text-gray-900">₹{totalCharges.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Selected GRs</span>
                      <span className="font-semibold text-gray-900">{selectedBookings.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div 
                className="space-y-3"
                style={{
                  animationDelay: '600ms',
                  animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <button
                  type="submit"
                  disabled={loading || selectedBookings.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Creating Challan...</span>
                    </div>
                  ) : (
                    'Create Challan'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/challans')}
                  className="w-full bg-white text-gray-700 py-3 px-4 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CreateChallanPage;