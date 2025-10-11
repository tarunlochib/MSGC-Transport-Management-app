import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChallanCard, FormField, Button, Alert, ChallanHeader } from './components';
import axios from 'axios';

const EditChallanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    challanNumber: '',
    transportCompanyId: '',
    truckId: '',
    driverId: '',
    fromLocation: '',
    toLocation: '',
    notes: '',
    challanDate: '',
    status: ''
  });

  const [transporters, setTransporters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [challanBookings, setChallanBookings] = useState([]);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showBookingManager, setShowBookingManager] = useState(false);
  const [filterData, setFilterData] = useState({ fromLocation: '', toLocation: '' });
  const [filteredBookings, setFilteredBookings] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchChallanDetails();
  }, [id]);

  useEffect(() => {
    if (formData.transportCompanyId) {
      fetchVehiclesAndDrivers();
    }
  }, [formData.transportCompanyId]);

  const fetchInitialData = async () => {
    try {
      const [transportersRes, availableBookingsRes] = await Promise.all([
        axios.get('/api/transporters'),
        axios.get('/api/challans/available-bookings')
      ]);
      setTransporters(transportersRes.data);
      setAvailableBookings(availableBookingsRes.data);
      setFilteredBookings(availableBookingsRes.data);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data.');
      setLoading(false);
    }
  };

  const fetchChallanDetails = async () => {
    try {
      const response = await axios.get(`/api/challans/${id}`);
      const challan = response.data;

      console.log('Loaded challan data:', challan);
      setFormData({
        challanNumber: challan.challanNumber || '',
        transportCompanyId: challan.transportCompanyId || '',
        truckId: challan.truckId || '',
        driverId: challan.driverId || '',
        fromLocation: challan.fromLocation || '',
        toLocation: challan.toLocation || '',
        notes: challan.notes || '',
        challanDate: challan.createdAt ? new Date(challan.createdAt).toISOString().split('T')[0] : '',
        status: challan.status || 'Generated'
      });
      
      // Set challan bookings
      if (challan.challanGoods) {
        setChallanBookings(challan.challanGoods);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching challan details:', err);
      setError('Failed to load challan details.');
      setLoading(false);
    }
  };

  const fetchVehiclesAndDrivers = async () => {
    try {
      const [vehiclesRes, driversRes] = await Promise.all([
        axios.get('/api/vehicles'),
        axios.get('/api/drivers')
      ]);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      console.error('Error fetching vehicles and drivers:', err);
      setVehicles([]);
      setDrivers([]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData(prev => ({ ...prev, [name]: value }));
    
    // Filter bookings
    let filtered = availableBookings;
    if (value) {
      filtered = availableBookings.filter(booking =>
        booking[name]?.toLowerCase().includes(value.toLowerCase())
      );
    }
    setFilteredBookings(filtered);
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

  const addBookingsToChallan = async () => {
    if (selectedBookings.length === 0) {
      setError('Please select at least one booking to add');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`/api/challans/${id}/bookings`, {
        bookingIds: selectedBookings.map(b => b.id)
      });
      
      setSuccess(response.data.message);
      
      // Refresh challan details and available bookings
      await Promise.all([
        fetchChallanDetails(),
        fetchInitialData()
      ]);
      
      // Clear selection and close manager
      setSelectedBookings([]);
      setShowBookingManager(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add bookings to challan');
    } finally {
      setSubmitting(false);
    }
  };

  const removeBookingFromChallan = async (bookingId) => {
    if (!window.confirm('Are you sure you want to remove this booking from the challan?')) {
      return;
    }

    try {
      setSubmitting(true);
      await axios.delete(`/api/challans/${id}/bookings/${bookingId}`);
      
      setSuccess('Booking removed successfully');
      
      // Refresh challan details and available bookings
      await Promise.all([
        fetchChallanDetails(),
        fetchInitialData()
      ]);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove booking from challan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!formData.transportCompanyId || !formData.truckId || !formData.driverId) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    if (loading) {
      setError('Please wait for data to load.');
      setSubmitting(false);
      return;
    }

    try {
      console.log('Submitting form data:', formData);
      await axios.put(`/api/challans/${id}`, formData);
      setSuccess('Challan updated successfully!');
      setTimeout(() => navigate('/challans'), 1500);
    } catch (err) {
      console.error('Error updating challan:', err);
      setError(err.response?.data?.error || 'Failed to update challan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading challan details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="error" message={error} onClose={() => setError(null)} />
          <div className="mt-4 text-center">
            <Button onClick={() => navigate('/challans')} variant="secondary">Back to Challans</Button>
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
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Challan</h1>
                <p className="text-gray-600 mt-1">Update challan #{formData.challanNumber} details</p>
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
            <Alert variant="error">
              {error}
            </Alert>
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
            <Alert variant="success">
              {success}
            </Alert>
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
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Challan Details</h3>
                      <p className="text-green-100 text-sm">Update transport and challan information</p>
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
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white hover:bg-gray-50 transition-all duration-200"
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
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    <FormField
                      label="Challan Date"
                      name="challanDate"
                      value={formData.challanDate}
                      onChange={handleFormChange}
                      type="date"
                      placeholder="Select challan date"
                    />

                    <FormField
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      type="select"
                      options={[
                        { value: 'Generated', label: 'Generated' },
                        { value: 'In Transit', label: 'In Transit' },
                        { value: 'Delivered', label: 'Delivered' }
                      ]}
                      placeholder="Select status"
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
            </div>

            {/* Right Column - Summary & Actions */}
            <div className="xl:col-span-1 space-y-6">
              {/* Booking Management */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: '250ms',
                  animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Bookings</h3>
                        <p className="text-purple-100 text-sm">{challanBookings.length} booking(s) in challan</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBookingManager(!showBookingManager)}
                      className="px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
                    >
                      {showBookingManager ? 'Close' : 'Manage'}
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {challanBookings.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No bookings in this challan</p>
                      <button
                        onClick={() => setShowBookingManager(true)}
                        className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Add Bookings
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {challanBookings.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              GR: {item.booking?.grNumber || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.packages} packages • {item.weight} kg
                            </div>
                          </div>
                          <button
                            onClick={() => removeBookingFromChallan(item.bookingId)}
                            disabled={submitting}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200 disabled:opacity-50"
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

              {/* Booking Manager Modal */}
              {showBookingManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">Add Bookings to Challan</h3>
                            <p className="text-purple-100 text-sm">Select bookings to add to this challan</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setShowBookingManager(false);
                            setSelectedBookings([]);
                          }}
                          className="text-white/80 hover:text-white transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Available Bookings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Available Bookings</h4>
                          
                          {/* Filters */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <input
                              type="text"
                              placeholder="From Location"
                              name="fromLocation"
                              value={filterData.fromLocation}
                              onChange={handleFilterChange}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                            <input
                              type="text"
                              placeholder="To Location"
                              name="toLocation"
                              value={filterData.toLocation}
                              onChange={handleFilterChange}
                              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                          </div>

                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {filteredBookings.length === 0 ? (
                              <p className="text-gray-500 text-sm text-center py-4">No available bookings</p>
                            ) : (
                              filteredBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                    selectedBookings.some(b => b.id === booking.id)
                                      ? 'border-purple-500 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300 bg-white'
                                  }`}
                                  onClick={() => toggleBookingSelection(booking)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                        selectedBookings.some(b => b.id === booking.id)
                                          ? 'border-purple-500 bg-purple-500'
                                          : 'border-gray-300'
                                      }`}>
                                        {selectedBookings.some(b => b.id === booking.id) && (
                                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900 text-sm">GR: {booking.grNumber}</div>
                                        <div className="text-xs text-gray-600">{booking.destinationLocation}</div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs font-medium text-gray-900">{booking.packages} packages</div>
                                      <div className="text-xs text-gray-600">{booking.weight} kg</div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Selected Bookings */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Selected Bookings ({selectedBookings.length})
                          </h4>
                          
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {selectedBookings.length === 0 ? (
                              <p className="text-gray-500 text-sm text-center py-4">No bookings selected</p>
                            ) : (
                              selectedBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium text-gray-900 text-sm">GR: {booking.grNumber}</div>
                                    <div className="text-xs text-gray-600">{booking.destinationLocation}</div>
                                  </div>
                                  <button
                                    onClick={() => removeSelectedBooking(booking.id)}
                                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setShowBookingManager(false);
                          setSelectedBookings([]);
                        }}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addBookingsToChallan}
                        disabled={submitting || selectedBookings.length === 0}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? 'Adding...' : `Add ${selectedBookings.length} Booking(s)`}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Challan Info */}
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                style={{
                  animationDelay: '300ms',
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
                      <h3 className="text-lg font-semibold text-white">Current Challan</h3>
                      <p className="text-blue-100 text-sm">Challan #{formData.challanNumber}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Challan Number</span>
                      <span className="font-semibold text-gray-900">{formData.challanNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transport Company</span>
                      <span className="font-semibold text-gray-900">
                        {transporters.find(t => t.id === formData.transportCompanyId)?.name || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Vehicle</span>
                      <span className="font-semibold text-gray-900">
                        {vehicles.find(v => v.id === formData.truckId)?.vehicleNumber || 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Driver</span>
                      <span className="font-semibold text-gray-900">
                        {drivers.find(d => d.id === formData.driverId)?.name || 'Not selected'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div 
                className="space-y-3"
                style={{
                  animationDelay: '400ms',
                  animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Updating Challan...</span>
                    </div>
                  ) : (
                    'Update Challan'
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

      <style jsx>{`
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

export default EditChallanPage;