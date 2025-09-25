import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ViewBookingHeader from './components/ViewBookingHeader';
import ViewBookingCard from './components/ViewBookingCard';
import ViewBookingInfoField from './components/ViewBookingInfoField';
import ViewBookingPaymentStatus from './components/ViewBookingPaymentStatus';
import ViewBookingLoading from './components/ViewBookingLoading';
import ViewBookingError from './components/ViewBookingError';

const ViewBookingPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [transporter, setTransporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/${id}`);
      setBooking(response.data);
      
      // Fetch transporter details if transporterId exists
      if (response.data.transporterId) {
        try {
          const transporterResponse = await axios.get(`/api/transporters/${response.data.transporterId}`);
          setTransporter(transporterResponse.data);
        } catch (transporterError) {
          console.error('Error fetching transporter:', transporterError);
          // Don't set error for transporter fetch failure
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateTotalCharges = (booking) => {
    const freight = parseFloat(booking.freightCharges) || 0;
    const localCartage = parseFloat(booking.localCartageCharges) || 0;
    const doorDelivery = parseFloat(booking.doorDeliveryCharges) || 0;
    const stationary = parseFloat(booking.stationaryCharges) || 0;
    const labour = parseFloat(booking.labourCharges) || 0;
    const other = parseFloat(booking.otherCharges) || 0;
    
    const total = freight + localCartage + doorDelivery + stationary + labour + other;
    return total % 1 === 0 ? total.toString() : total.toFixed(2);
  };

  if (loading) {
    return <ViewBookingLoading />;
  }

  if (error) {
    return <ViewBookingError error={error} />;
  }

  if (!booking) {
    return <ViewBookingError message="Booking not found" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <ViewBookingHeader bookingId={id} grNumber={booking.grNumber} />
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <ViewBookingCard
            title="Basic Information"
            icon={
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            iconColor="bg-blue-100"
            animationDelay="100ms"
          >
            <div className="grid grid-cols-2 gap-4">
              <ViewBookingInfoField label="GR Number" value={booking.grNumber} />
              <ViewBookingInfoField label="Booking Date" value={formatDate(booking.bookingDate)} />
              <ViewBookingPaymentStatus paymentMethod={booking.paymentMethod} />
              <ViewBookingInfoField label="Delivery Against" value={booking.deliveryAgainst} />
              <ViewBookingInfoField label="Weight (kg)" value={booking.weightKg} />
              {transporter && (
                <ViewBookingInfoField label="Transporter" value={transporter.name} />
              )}
            </div>
            
            {/* Item Description - Full width */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <ViewBookingInfoField 
                label="Item Description" 
                value={booking.itemDescription || (booking.packages && booking.packages.length > 0 ? booking.packages[0].itemDescription : null) || "No description provided"}
                className="col-span-2"
              />
            </div>
          </ViewBookingCard>

          {/* Route Information */}
          <ViewBookingCard
            title="Route Information"
            icon={
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            iconColor="bg-green-100"
            animationDelay="200ms"
          >
            <div className="grid grid-cols-1 gap-4">
              <ViewBookingInfoField label="From Location" value={booking.fromLocation} />
              <ViewBookingInfoField label="To Location" value={booking.toLocation} />
              <ViewBookingInfoField label="E-Way Bill" value={booking.ewayBill} />
              <ViewBookingInfoField label="Private Marka" value={booking.privateMarka} />
            </div>
          </ViewBookingCard>

          {/* Consignor and Consignee Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consignor Information */}
            <ViewBookingCard
              title="Consignor Details"
              icon={
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              iconColor="bg-purple-100"
              animationDelay="300ms"
            >
              <div className="grid grid-cols-1 gap-4">
                <ViewBookingInfoField label="Name" value={booking.consignorName} />
                <ViewBookingInfoField label="Address" value={booking.consignorAddress} />
                <ViewBookingInfoField label="GST Number" value={booking.consignorGST} />
              </div>
            </ViewBookingCard>

            {/* Consignee Information */}
            <ViewBookingCard
              title="Consignee Details"
              icon={
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              iconColor="bg-indigo-100"
              animationDelay="400ms"
            >
              <div className="grid grid-cols-1 gap-4">
                <ViewBookingInfoField label="Name" value={booking.consigneeName} />
                <ViewBookingInfoField label="Address" value={booking.consigneeAddress} />
                <ViewBookingInfoField label="GST Number" value={booking.consigneeGST} />
              </div>
            </ViewBookingCard>
          </div>

          {/* Charges Information */}
          <ViewBookingCard
            title="Charges Information"
            icon={
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            iconColor="bg-yellow-100"
            animationDelay="500ms"
          >
            <div className="grid grid-cols-2 gap-4">
              <ViewBookingInfoField label="Freight Charges" value={`₹${booking.freightCharges || 0}`} />
              <ViewBookingInfoField label="Local Cartage" value={`₹${booking.localCartageCharges || 0}`} />
              <ViewBookingInfoField label="Door Delivery" value={`₹${booking.doorDeliveryCharges || 0}`} />
              <ViewBookingInfoField label="Stationary" value={`₹${booking.stationaryCharges || 0}`} />
              <ViewBookingInfoField label="Labour" value={`₹${booking.labourCharges || 0}`} />
              <ViewBookingInfoField label="Other Charges" value={`₹${booking.otherCharges || 0}`} />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Total Charges</p>
                <p className="text-lg font-bold text-blue-900">₹{calculateTotalCharges(booking)}</p>
              </div>
            </div>
          </ViewBookingCard>

          {/* Package Information */}
          {booking.packages && booking.packages.length > 0 && (
            <ViewBookingCard
              title="Package Information"
              icon={
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              iconColor="bg-orange-100"
              animationDelay="600ms"
            >
              <div className="space-y-4">
                {booking.packages.map((pkg, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <ViewBookingInfoField label="Number of Items" value={pkg.numberOfItems || 0} />
                      <ViewBookingInfoField label="Packaging Type" value={pkg.packagingType || "Not specified"} />
                      <ViewBookingInfoField label="Weight (kg)" value={pkg.weightKg ? `${pkg.weightKg}Kgs` : "0Kgs"} />
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <ViewBookingInfoField 
                        label="Item Description" 
                        value={pkg.itemDescription || "No description provided"}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ViewBookingCard>
          )}

          {/* Invoice Information */}
          {booking.invoices && booking.invoices.length > 0 && (
            <ViewBookingCard
              title="Invoice Information"
              icon={
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              iconColor="bg-red-100"
              animationDelay="700ms"
            >
              <div className="space-y-4">
                {booking.invoices.map((invoice, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <ViewBookingInfoField label="Invoice Number" value={invoice.invoiceNo} />
                      <ViewBookingInfoField label="Invoice Value" value={`₹${invoice.invoiceValue || 0}`} />
                    </div>
                  </div>
                ))}
              </div>
            </ViewBookingCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewBookingPage; 