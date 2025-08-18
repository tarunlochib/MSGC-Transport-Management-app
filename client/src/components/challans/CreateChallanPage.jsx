import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  // Form data
  const [formData, setFormData] = useState({
    transportCompanyId: '',
    truckId: '',
    driverId: '',
    fromLocation: '',
    toLocation: '',
    notes: ''
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
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.transportCompanyId) {
      fetchVehiclesAndDrivers();
      fetchAvailableBookings();
    } else {
      // Reset vehicles and drivers when transporter changes
      setVehicles([]);
      setDrivers([]);
      setAvailableBookings([]);
      setFilteredBookings([]);
      setSelectedBookings([]);
      setFormData(prev => ({ ...prev, truckId: '', driverId: '' }));
    }
  }, [formData.transportCompanyId]);

  useEffect(() => {
    if (filterData.fromLocation || filterData.toLocation) {
      filterBookings();
    } else {
      setFilteredBookings(availableBookings || []);
    }
  }, [filterData.fromLocation, filterData.toLocation, availableBookings]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch transporters only - bookings will be fetched when transporter is selected
      const transportersResponse = await fetch('/api/transporters');
      if (!transportersResponse.ok) {
        throw new Error('Failed to fetch transporters');
      }
      const transportersData = await transportersResponse.json();
      setTransporters(transportersData || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclesAndDrivers = async () => {
    try {
      // Fetch vehicles for selected transporter
      const vehiclesResponse = await fetch(`/api/vehicles?transporterId=${formData.transportCompanyId}`);
      if (!vehiclesResponse.ok) {
        throw new Error('Failed to fetch vehicles');
      }
      const vehiclesData = await vehiclesResponse.json();
      setVehicles(vehiclesData || []);

      // Fetch drivers for selected transporter
      const driversResponse = await fetch('/api/drivers');
      if (!driversResponse.ok) {
        throw new Error('Failed to fetch drivers');
      }
      const driversData = await driversResponse.json();
      setDrivers(driversData || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles and drivers');
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      const response = await fetch(`/api/challans/available-bookings?transporterId=${formData.transportCompanyId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available bookings');
      }
      const data = await response.json();
      setAvailableBookings(data || []);
      setFilteredBookings(data || []);
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
        throw new Error(errorData.message || 'Failed to create challan');
      }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ChallanHeader 
          title="Create New Challan"
          subtitle="Generate challan for selected GRs with transport details"
          onAddChallan={() => navigate('/challans')}
        />

        {/* Error/Success Alerts */}
        {error && (
          <Alert 
            type="error" 
            title="Error"
            message={error}
            show={true}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {success && (
          <Alert 
            type="success" 
            title="Success"
            message={success}
            show={true}
            className="mb-6"
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Challan Details Section */}
          <ChallanCard 
            title="Challan Details"
            subtitle="Enter transport company, vehicle, and driver information"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white hover:bg-gray-50 hover:scale-[1.01] transition-all duration-200"
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
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white hover:bg-gray-50 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white hover:bg-gray-50 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="Additional notes (optional)"
              />
            </div>
          </ChallanCard>

          {/* Available GRs Section */}
          <ChallanCard 
            title="Available GRs"
            subtitle="Select GRs to include in this challan"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          >
            {!formData.transportCompanyId ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <p className="text-gray-500">Please select a transport company first to view available GRs</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap gap-4 items-end">
                    <FormField
                      label="Filter by From Location"
                      name="fromLocation"
                      value={filterData.fromLocation}
                      onChange={handleFilterChange}
                      placeholder="Filter by departure location"
                      className="flex-1 min-w-48"
                    />
                    <FormField
                      label="Filter by To Location"
                      name="toLocation"
                      value={filterData.toLocation}
                      onChange={handleFilterChange}
                      placeholder="Filter by destination location"
                      className="flex-1 min-w-48"
                    />
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="mb-2"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>

                {/* GR List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No available GRs found for the selected criteria
                    </div>
                  ) : (
                    filteredBookings.map(booking => {
                      const isSelected = selectedBookings.some(b => b.id === booking.id);
                      return (
                        <div
                          key={booking.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => toggleBookingSelection(booking)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">GR #{booking.grNumber}</p>
                                  <p className="text-sm text-gray-600">{booking.destinationLocation}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">{booking.packages} packages</p>
                              <p className="text-sm text-gray-600">{booking.weight} kg</p>
                              <p className="text-sm font-medium text-blue-600">₹{booking.charges}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </ChallanCard>

          {/* Selected GRs Section */}
          {selectedBookings.length > 0 && (
            <ChallanCard 
              title="Selected GRs"
              subtitle={`${selectedBookings.length} GR(s) selected for challan`}
              icon={
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <div className="space-y-3">
                {selectedBookings.map(booking => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">GR #{booking.grNumber}</p>
                      <p className="text-sm text-gray-600">{booking.destinationLocation}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{booking.packages} packages</p>
                        <p className="text-sm text-gray-600">{booking.weight} kg</p>
                        <p className="font-medium text-blue-600">₹{booking.charges}</p>
                      </div>
                      <Button
                        variant="danger"
                        size="xs"
                        onClick={() => removeSelectedBooking(booking.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ChallanCard>
          )}

          {/* Summary Section */}
          {selectedBookings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Total Packages"
                value={totalPackages}
                subtitle="Total packages in challan"
                icon={
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
                color="blue"
              />
              <StatsCard
                title="Total Weight"
                value={`${totalWeight} kg`}
                subtitle="Total weight in challan"
                icon={
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                }
                color="green"
              />
              <StatsCard
                title="Total Charges"
                value={`₹${totalCharges}`}
                subtitle="Total charges in challan"
                icon={
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
                color="purple"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/challans')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={selectedBookings.length === 0}
            >
              Create Challan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallanPage;
