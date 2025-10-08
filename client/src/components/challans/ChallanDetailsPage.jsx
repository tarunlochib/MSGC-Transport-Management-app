import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChallanCard, Button, Alert, StatsCard, ChallanHeader } from './components';
import { format } from 'date-fns';

const ChallanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    fetchChallanDetails();
  }, [id]);

  const fetchChallanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/challans/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch challan details');
      }
      const data = await response.json();
      setChallan(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this challan? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/challans/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete challan');
        }
        navigate('/challans');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await fetch(`/api/challans/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      setChallan(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError(err.message);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="error">
            {error}
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => navigate('/challans')} variant="secondary">Back to Challans</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Challan not found</p>
            <Button onClick={() => navigate('/challans')} variant="secondary" className="mt-4">Back to Challans</Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Transit':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'Delivered':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Challan Details</h1>
                <p className="text-gray-600 mt-1">Challan #{challan.challanNumber} • {format(new Date(challan.createdAt), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor(challan.status)}`}>
                {getStatusIcon(challan.status)}
                <span className="text-sm font-medium">{challan.status}</span>
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
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="xl:col-span-2 space-y-6">
            {/* Challan Information */}
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
                    <h3 className="text-lg font-semibold text-white">Challan Information</h3>
                    <p className="text-blue-100 text-sm">Transport and delivery details</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Challan Number</label>
                      <div className="text-lg font-semibold text-gray-900">#{challan.challanNumber}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Transport Company</label>
                      <div className="text-gray-900">{challan.transportCompany?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Vehicle</label>
                      <div className="text-gray-900">
                        {challan.truck ? `Truck #${challan.truck.vehicleNumber}` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Driver</label>
                      <div className="text-gray-900">{challan.driver?.name || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">From Location</label>
                      <div className="text-gray-900">{challan.fromLocation || 'Not specified'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">To Location</label>
                      <div className="text-gray-900">{challan.toLocation || 'Not specified'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                      <div className="text-gray-900">{format(new Date(challan.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-lg border ${getStatusColor(challan.status)}`}>
                        {getStatusIcon(challan.status)}
                        <span className="text-sm font-medium">{challan.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {challan.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">{challan.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GRs in Challan */}
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
                      <h3 className="text-lg font-semibold text-white">GRs in Challan</h3>
                      <p className="text-emerald-100 text-sm">{challan.challanGoods?.length || 0} GRs included</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {challan.challanGoods && challan.challanGoods.length > 0 ? (
                  <div className="space-y-3">
                    {challan.challanGoods.map((challanGood, index) => (
                      <div
                        key={challanGood.id}
                        className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
                        style={{
                          animationDelay: `${400 + (index * 100)}ms`,
                          animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <span className="text-emerald-600 font-semibold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                GR: {challanGood.booking?.grNumber || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">
                                {challanGood.booking?.destinationLocation || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {challanGood.quantity} packages
                            </div>
                            <div className="text-sm text-gray-600">
                              {challanGood.weight} kg
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No GRs found in this challan</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="xl:col-span-1 space-y-6">
            {/* Summary Stats */}
            <div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              style={{
                animationDelay: '400ms',
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
                  <span className="font-semibold text-gray-900">{challan.totalPackages || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Weight</span>
                  <span className="font-semibold text-gray-900">{challan.totalWeight || 0} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Charges</span>
                  <span className="font-semibold text-gray-900">₹{(challan.totalCharges || 0).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">GRs Count</span>
                    <span className="font-semibold text-gray-900">{challan.challanGoods?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Management */}
            <div 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              style={{
                animationDelay: '500ms',
                animation: isVisible ? 'slideInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Status Management</h3>
                    <p className="text-purple-100 text-sm">Update challan status</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                {challan.status !== 'In Transit' && (
                  <button
                    onClick={() => handleStatusUpdate('In Transit')}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200"
                  >
                    Mark as In Transit
                  </button>
                )}
                {challan.status !== 'Delivered' && (
                  <button
                    onClick={() => handleStatusUpdate('Delivered')}
                    className="w-full bg-green-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2 transition-all duration-200"
                  >
                    Mark as Delivered
                  </button>
                )}
                {challan.status !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusUpdate('Cancelled')}
                    className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 transition-all duration-200"
                  >
                    Mark as Cancelled
                  </button>
                )}
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
                onClick={() => navigate(`/challans/${id}/edit`)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Challan</span>
                </div>
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full bg-white text-red-600 py-3 px-4 rounded-xl font-semibold border border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2 transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Challan</span>
                </div>
              </button>
            </div>
          </div>
        </div>
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

export default ChallanDetailsPage;