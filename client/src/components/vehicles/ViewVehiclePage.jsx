import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewVehiclePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      console.log('Fetching vehicle with ID:', id);
      const response = await axios.get(`/api/vehicles/${id}`);
      console.log('Vehicle data received:', response.data);
      setVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      setError('Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'maintenance':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'inactive':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'maintenance':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Vehicle</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Vehicle Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">The vehicle you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 animate-slideDown">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border border-blue-100/50">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-20 h-20 bg-blue-400 rounded-full -translate-x-10 -translate-y-10"></div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400 rounded-full translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 left-1/2 w-12 h-12 bg-indigo-400 rounded-full -translate-x-6 translate-y-6"></div>
            </div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="animate-slideIn">
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Vehicle Details
                </h1>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                  Vehicle Number: {vehicle.vehicleNumber}
                </p>
                <div className="mt-3 flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Document tracking</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Fleet management</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 animate-slideUp flex gap-2">
                <Link
                  to={`/vehicles/${id}/edit`}
                  className="group inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Vehicle
                </Link>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="group inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Vehicles
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white shadow-md rounded-lg animate-slideUp border border-gray-100">
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {getStatusIcon(vehicle.status)}
                  <span className="ml-1">{vehicle.status}</span>
                </span>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Vehicle Number</label>
                  <p className="text-sm text-gray-900">{vehicle.vehicleNumber}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Registration Number</label>
                  <p className="text-sm text-gray-900">{vehicle.registrationNumber}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Make</label>
                  <p className="text-sm text-gray-900">{vehicle.make}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Model</label>
                  <p className="text-sm text-gray-900">{vehicle.model}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Year</label>
                  <p className="text-sm text-gray-900">{vehicle.year || 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Capacity</label>
                  <p className="text-sm text-gray-900">{vehicle.capacity} tons</p>
                </div>
              </div>
            </div>

            {/* Status and Assignment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Status & Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Status</label>
                  <p className="text-sm text-gray-900">{vehicle.status}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Assigned Driver</label>
                  <p className="text-sm text-gray-900">{vehicle.driverName || 'Not assigned'}</p>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Technical Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Fuel Type</label>
                  <p className="text-sm text-gray-900">{vehicle.fuelType}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Insurance Expiry</label>
                  <p className="text-sm text-gray-900">{vehicle.insuranceExpiry ? formatDate(vehicle.insuranceExpiry) : 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Permit Expiry</label>
                  <p className="text-sm text-gray-900">{vehicle.permitExpiry ? formatDate(vehicle.permitExpiry) : 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Fitness Expiry</label>
                  <p className="text-sm text-gray-900">{vehicle.fitnessExpiry ? formatDate(vehicle.fitnessExpiry) : 'Not specified'}</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">PUC Expiry</label>
                  <p className="text-sm text-gray-900">{vehicle.pucExpiry ? formatDate(vehicle.pucExpiry) : 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {vehicle.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Additional Notes
                </h3>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{vehicle.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewVehiclePage; 