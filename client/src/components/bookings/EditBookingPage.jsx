import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import performanceOptimizer from '../../utils/performanceOptimization';

// Import components
import BookingHeader from './components/BookingHeader';
import ProgressSteps from './components/ProgressSteps';
import FormContainer from './components/FormContainer';
import NavigationButtons from './components/NavigationButtons';
import BasicDetailsStep from './components/steps/BasicDetailsStep';
import PackagesStep from './components/steps/PackagesStep';
import WeightStep from './components/steps/WeightStep';
import InvoicesStep from './components/steps/InvoicesStep';
import ConsignorDetailsStep from './components/steps/ConsignorDetailsStep';
import ConsigneeDetailsStep from './components/steps/ConsigneeDetailsStep';
import RouteDetailsStep from './components/steps/RouteDetailsStep';
import ChargesStep from './components/steps/ChargesStep';

const EditBookingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transporters, setTransporters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    grNumber: '',
    bookingDate: '',
    consignorName: '',
    consignorAddress: '',
    consignorGST: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeGST: '',
    fromLocation: '',
    toLocation: '',
    ewayBill: '',
    privateMarka: '',
    paymentMethod: '',
    paymentType: '',
    deliveryAgainst: '',
    freightCharges: '',
    localCartageCharges: '',
    doorDeliveryCharges: '',
    stationaryCharges: '',
    labourCharges: '',
    otherCharges: '',
    totalCharges: '',
    transporterId: '',
    vehicleId: '',
    driverId: '',
    consignorId: '',
    consigneeId: '',
    godownId: '',
    packages: [],
    invoices: [],
    totalWeight: ''
  });

  const steps = [
    { id: 1, name: 'Basic Details', description: 'GR Number, Date, Transporter' },
    { id: 2, name: 'Goods Information', description: 'Packages and items details' },
    { id: 3, name: 'Weight Information', description: 'Weight for all packages' },
    { id: 4, name: 'Invoice Details', description: 'Invoice information' },
    { id: 5, name: 'Consignor Details', description: 'Sender information' },
    { id: 6, name: 'Consignee Details', description: 'Receiver information' },
    { id: 7, name: 'Route Details', description: 'From and to locations' },
    { id: 8, name: 'Charges & Assignment', description: 'Payment, charges and vehicle/driver assignment' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (id && transporters.length > 0) {
      fetchBooking();
    }
  }, [id, transporters]);

  const fetchData = async () => {
    try {
      const [transportersRes, vehiclesRes, driversRes, customersRes] = await Promise.all([
        axios.get('/api/transporters'),
        axios.get('/api/vehicles'),
        axios.get('/api/drivers'),
        axios.get('/api/customers')
      ]);
      setTransporters(transportersRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch godowns when transporter is selected
  const fetchGodowns = async (transporterId) => {
    try {
      console.log('Fetching godowns for transporter ID:', transporterId);
      const response = await axios.get(`/api/godowns/transporter/${transporterId}`);
      console.log('Godowns response:', response.data);
      setGodowns(response.data);
    } catch (error) {
      console.error('Error fetching godowns:', error);
      setGodowns([]);
    }
  };

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/${id}`);
      const booking = response.data;
      
      setFormData({
        grNumber: booking.grNumber || '',
        bookingDate: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : '',
        consignorName: booking.consignorName || '',
        consignorAddress: booking.consignorAddress || '',
        consignorGST: booking.consignorGST || '',
        consigneeName: booking.consigneeName || '',
        consigneeAddress: booking.consigneeAddress || '',
        consigneeGST: booking.consigneeGST || '',
        fromLocation: booking.fromLocation || '',
        toLocation: booking.toLocation || '',
        ewayBill: booking.ewayBill || '',
        privateMarka: booking.privateMarka || '',
        paymentMethod: booking.paymentMethod || '',
        paymentType: booking.paymentType || '',
        deliveryAgainst: booking.deliveryAgainst || '',
        freightCharges: booking.freightCharges || '',
        localCartageCharges: booking.localCartageCharges || '',
        doorDeliveryCharges: booking.doorDeliveryCharges || '',
        stationaryCharges: booking.stationaryCharges || '',
        labourCharges: booking.labourCharges || '',
        otherCharges: booking.otherCharges || '',
        totalCharges: booking.totalCharges || '',
        transporterId: booking.transporterId || '',
        vehicleId: booking.vehicleId || '',
        driverId: booking.driverId || '',
        consignorId: booking.consignorId || '',
        consigneeId: booking.consigneeId || '',
        godownId: booking.godownId || '',
        packages: booking.packages || [],
        invoices: booking.invoices || [],
        totalWeight: booking.weightKg || ''
      });

      // Fetch godowns if this is the specific transporter
      if (booking.transporterId) {
        const selectedTransporter = transporters.find(t => t.id === booking.transporterId);
        console.log('Selected transporter:', selectedTransporter);
        console.log('Contact info:', selectedTransporter?.contactInfo);
        
        if (selectedTransporter && selectedTransporter.contactInfo && 
            selectedTransporter.contactInfo.includes('07AAUCS4940E1Z1')) {
          console.log('Fetching godowns for transporter:', selectedTransporter.name);
          await fetchGodowns(booking.transporterId);
        } else {
          console.log('Not the target transporter or no contact info');
        }
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleGSTChange = async (type, gstNumber) => {
    if (!gstNumber) return;
    
    try {
      const response = await axios.get(`/api/customers/gst/${gstNumber}`);
      const customer = response.data;
      
      if (type === 'consignor') {
        setFormData(prev => ({
          ...prev,
          consignorName: customer.name,
          consignorAddress: customer.address,
          consignorGST: customer.gstNumber,
          consignorId: customer.id
        }));
      } else if (type === 'consignee') {
        setFormData(prev => ({
          ...prev,
          consigneeName: customer.name,
          consigneeAddress: customer.address,
          consigneeGST: customer.gstNumber,
          consigneeId: customer.id
        }));
      }
    } catch (error) {
      console.error('Error fetching customer by GST:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Calculate total charges before submitting
      const totalCharges = calculateTotalCharges();
      const bookingData = {
        ...formData,
        totalCharges: totalCharges,
        weightKg: parseFloat(formData.totalWeight || 0),
        // Remove the id field from packages and invoices as they'll be updated by the backend
        packages: formData.packages?.map(pkg => ({
          numberOfItems: parseInt(pkg.numberOfItems),
          packagingType: pkg.packagingType,
          itemDescription: pkg.itemDescription,
          weightKg: parseFloat(pkg.weightKg || 0)
        })) || [],
        invoices: formData.invoices?.map(invoice => ({
          invoiceNo: invoice.invoiceNo,
          invoiceValue: parseFloat(invoice.invoiceValue)
        })) || []
      };
      
      await axios.put(`/api/bookings/${id}`, bookingData);
      
      // Invalidate dashboard cache to ensure fresh data
      performanceOptimizer.clearCacheEntry('bookings');
      performanceOptimizer.clearCacheEntry('challans');
      
      navigate('/bookings');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle transporter change
  const handleTransporterChange = (transporterId) => {
    setFormData(prev => ({ ...prev, transporterId, godownId: '' }));
    
    // Check if this is the specific transporter that needs godown selection
    const selectedTransporter = transporters.find(t => t.id === transporterId);
    if (selectedTransporter && selectedTransporter.contactInfo && 
        selectedTransporter.contactInfo.includes('07AAUCS4940E1Z1')) {
      fetchGodowns(transporterId);
    } else {
      setGodowns([]);
    }
  };

  const calculateTotalCharges = () => {
    const freight = parseFloat(formData.freightCharges) || 0;
    const localCartage = parseFloat(formData.localCartageCharges) || 0;
    const doorDelivery = parseFloat(formData.doorDeliveryCharges) || 0;
    const stationary = parseFloat(formData.stationaryCharges) || 0;
    const labour = parseFloat(formData.labourCharges) || 0;
    const other = parseFloat(formData.otherCharges) || 0;
    
    const total = freight + localCartage + doorDelivery + stationary + labour + other;
    return total % 1 === 0 ? total.toString() : total.toFixed(2);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        const basicValid = formData.grNumber && formData.bookingDate && formData.transporterId;
        // If godowns are available (specific transporter), godown selection is required
        if (godowns.length > 0) {
          return basicValid && formData.godownId;
        }
        return basicValid;
      case 2:
        return formData.packages.length > 0;
      case 3:
        return formData.totalWeight && parseFloat(formData.totalWeight) > 0;
      case 4:
        return formData.invoices.length > 0;
      case 5:
        return formData.consignorName && formData.consignorAddress;
      case 6:
        return formData.consigneeName && formData.consigneeAddress;
      case 7:
        return formData.fromLocation && formData.toLocation;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicDetailsStep 
            formData={formData} 
            setFormData={setFormData} 
            transporters={transporters}
            godowns={godowns}
            onTransporterChange={handleTransporterChange}
          />
        );
      case 2:
        return <PackagesStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <WeightStep formData={formData} setFormData={setFormData} />;
      case 4:
        return <InvoicesStep formData={formData} setFormData={setFormData} />;
      case 5:
        return <ConsignorDetailsStep formData={formData} setFormData={setFormData} customers={customers} handleGSTChange={handleGSTChange} />;
      case 6:
        return <ConsigneeDetailsStep formData={formData} setFormData={setFormData} customers={customers} handleGSTChange={handleGSTChange} />;
      case 7:
        return <RouteDetailsStep formData={formData} setFormData={setFormData} />;
      case 8:
        return (
          <ChargesStep 
            formData={formData} 
            setFormData={setFormData} 
            vehicles={vehicles} 
            drivers={drivers} 
            calculateTotalCharges={calculateTotalCharges}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fade-in">
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white shadow-md rounded-lg border border-gray-100 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Booking</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/bookings')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back to Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <BookingHeader 
          title="Edit Booking"
          subtitle="Update booking information step by step"
          currentStep={currentStep}
          totalSteps={steps.length}
          stepName={steps[currentStep - 1]?.name}
          backUrl="/bookings"
        />

        <ProgressSteps steps={steps} currentStep={currentStep} />

        <FormContainer onSubmit={handleSubmit}>
          {renderStepContent()}
          
          <NavigationButtons 
            currentStep={currentStep}
            totalSteps={steps.length}
            onPrevStep={prevStep}
            onNextStep={nextStep}
            isStepValid={isStepValid}
            submitting={submitting}
            submitText="Update Booking"
            submittingText="Updating..."
          />
        </FormContainer>
      </div>
    </div>
  );
};

export default EditBookingPage; 