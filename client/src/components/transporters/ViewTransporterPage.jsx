import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ViewTransporterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [transporter, setTransporter] = useState(null);

  useEffect(() => {
    fetchTransporter();
  }, [id]);

  const fetchTransporter = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/transporters/${id}`);
      setTransporter(response.data);
    } catch (error) {
      console.error('Error fetching transporter:', error);
      alert('Error fetching transporter details');
      navigate('/transporters');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '🟢';
      case 'inactive': return '⚫';
      case 'suspended': return '🔴';
      default: return '⚫';
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not specified';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as Indian phone number
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  const formatField = (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'Not specified';
    }
    return value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transporter) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Transporter not found</h1>
            <p className="text-sm text-gray-600 mb-4">The transporter you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/transporters')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Transporters
            </button>
          </div>
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
                  Transporter Details
                </h1>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                  Comprehensive information for {transporter.name}
                </p>
                <div className="mt-3 flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Commission tracking</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Partner management</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 lg:mt-0 animate-slideUp flex gap-2">
                <button
                  onClick={() => navigate('/transporters')}
                  className="group inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-md"
                >
                  <svg className="w-3 h-3 mr-1.5 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Transporters
                </button>
                <button
                  onClick={() => navigate(`/transporters/${id}/edit`)}
                  className="group inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-md text-xs font-medium"
                >
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Transporter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transporter Information */}
        <div className="space-y-4 animate-slideUp">
          {/* Basic Information Card */}
          <div className="bg-white shadow-md rounded-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Basic Information
              </h2>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transporter.status)}`}>
                {getStatusIcon(transporter.status)} {transporter.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Transporter Name</label>
                <p className="text-sm text-gray-900 font-medium">{transporter.name}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Commission Rate</label>
                <p className="text-sm text-gray-900 font-medium">₹{transporter.commissionRate} per kg</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">GST Number</label>
                <p className="text-sm text-gray-900">{formatField(transporter.gstNumber)}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">PAN Number</label>
                <p className="text-sm text-gray-900">{formatField(transporter.panNumber)}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Created Date</label>
                <p className="text-sm text-gray-900">{formatDate(transporter.createdAt)}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Last Updated</label>
                <p className="text-sm text-gray-900">{formatDate(transporter.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white shadow-md rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              Contact Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone Number</label>
                <p className="text-sm text-gray-900 font-medium">{formatPhoneNumber(transporter.phone)}</p>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
                <p className="text-sm text-gray-900">{formatField(transporter.email)}</p>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white shadow-md rounded-lg border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Address
            </h2>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Complete Address</label>
              <p className="text-sm text-gray-900">{transporter.address}</p>
            </div>
          </div>

          {/* Notes Card */}
          {transporter.notes && (
            <div className="bg-white shadow-md rounded-lg border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mr-2">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Additional Notes
              </h2>
              
              <div>
                <p className="text-sm text-gray-900">{transporter.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTransporterPage; 