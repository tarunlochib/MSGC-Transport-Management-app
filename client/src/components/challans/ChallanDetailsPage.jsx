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

  useEffect(() => {
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
      fetchChallanDetails(); // Refresh the data
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert 
            type="error" 
            title="Error Loading Challan"
            message={error}
            show={true}
          />
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => navigate('/challans')}>
              Back to Challans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!challan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert 
            type="error" 
            title="Challan Not Found"
            message="The requested challan could not be found."
            show={true}
          />
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={() => navigate('/challans')}>
              Back to Challans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'generated':
        return 'bg-blue-100 text-blue-800';
      case 'in-transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/challans')}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {challan.challanNumber}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Generated on {format(new Date(challan.dateGenerated), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(challan.status)}`}>
                {challan.status}
              </span>
              <Button variant="outline" size="xs">
                Print
              </Button>
              <Button variant="outline" size="xs">
                Edit
              </Button>
              <Button variant="danger" size="xs" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Status Update Section */}
        <ChallanCard 
          title="Update Status"
          subtitle="Change the current status of this challan"
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
          className="mb-6"
        >
          <div className="flex flex-wrap gap-2">
            {['Generated', 'In-Transit', 'Delivered', 'Cancelled'].map((status) => (
              <Button
                key={status}
                variant={challan.status === status ? "primary" : "outline"}
                size="xs"
                onClick={() => handleStatusUpdate(status)}
                disabled={challan.status === status}
              >
                {status}
              </Button>
            ))}
          </div>
        </ChallanCard>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Total Packages"
            value={challan.totalPackages}
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
            value={`${challan.totalWeight} kg`}
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
            value={`₹${challan.totalCharges}`}
            subtitle="Total charges in challan"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            color="purple"
          />
        </div>

        {/* Transport Details */}
        <ChallanCard 
          title="Transport Details"
          subtitle="Vehicle, driver, and route information"
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          }
          className="mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Transport Company</h4>
              <p className="text-lg font-semibold text-gray-900">
                {challan.transportCompany?.name || 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Vehicle</h4>
              <p className="text-lg font-semibold text-gray-900">
                Truck #{challan.truck?.vehicleNumber || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {challan.truck?.make} {challan.truck?.model}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Driver</h4>
              <p className="text-lg font-semibold text-gray-900">
                {challan.driver?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">
                {challan.driver?.phone || 'N/A'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">From Location</h4>
              <p className="text-lg font-semibold text-gray-900">
                {challan.fromLocation || 'Not specified'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">To Location</h4>
              <p className="text-lg font-semibold text-gray-900">
                {challan.toLocation || 'Not specified'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
              <p className="text-lg font-semibold text-gray-900">
                {challan.notes || 'No notes'}
              </p>
            </div>
          </div>
        </ChallanCard>

        {/* GR Details */}
        <ChallanCard 
          title="GR Details"
          subtitle={`${challan.challanGoods?.length || 0} GR(s) included in this challan`}
          icon={
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        >
          {challan.challanGoods && challan.challanGoods.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial No.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GR Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Packages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charges
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {challan.challanGoods.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.serialNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.booking?.grNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.packages}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.weight} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.destinationLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        ₹{item.charges}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No GR details available for this challan
            </div>
          )}
        </ChallanCard>
      </div>
    </div>
  );
};

export default ChallanDetailsPage;
