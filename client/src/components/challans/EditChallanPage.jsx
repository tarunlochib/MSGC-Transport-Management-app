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
      const [transportersRes] = await Promise.all([
        axios.get('/api/transporters'),
      ]);
      setTransporters(transportersRes.data);
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