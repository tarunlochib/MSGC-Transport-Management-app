import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const [transporters, setTransporters] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    totalWeight: '',
    ewayBillDetails: {
      generatedDate: '',
      expiryDate: '',
      billValue: ''
    }
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch godowns when transporter is selected
  const fetchGodowns = async (transporterId) => {
    try {
      const response = await axios.get(`/api/godowns/transporter/${transporterId}`);
      setGodowns(response.data);
    } catch (error) {
      console.error('Error fetching godowns:', error);
      setGodowns([]);
    }
  };

  // GST Auto-fill functionality
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

  const checkBookingExists = async () => {
    try {
      // Check if GR number already exists
      const bookings = await axios.get('/api/bookings');
      const existingBooking = bookings.data.find(booking => 
        booking.grNumber.toLowerCase() === formData.grNumber.toLowerCase()
      );
      
      if (existingBooking) {
        alert('Booking with this GR number already exists. Please use a different GR number.');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking booking existence:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Check if booking already exists
      const bookingExists = await checkBookingExists();
      if (bookingExists) {
        setSubmitting(false);
        return;
      }
      
      // Calculate total charges before submitting
      const totalCharges = calculateTotalCharges();
      
      // Calculate total weight from packages
      const totalWeight = formData.packages?.reduce((total, pkg) => {
        return total + (parseFloat(pkg.weightKg) || 0);
      }, 0) || 0;
      
      const bookingData = {
        ...formData,
        totalCharges: totalCharges,
        weightKg: totalWeight,
        // Remove the id field from packages and invoices as they'll be created by the backend
        packages: formData.packages?.map(pkg => ({
          numberOfItems: parseInt(pkg.numberOfItems),
          packagingType: pkg.packagingType,
          itemDescription: pkg.itemDescription,
          weightKg: parseFloat(pkg.weightKg)
        })) || [],
        invoices: formData.invoices?.map(invoice => ({
          invoiceNo: invoice.invoiceNo,
          invoiceValue: parseFloat(invoice.invoiceValue)
        })) || []
      };
      
      const response = await axios.post('/api/bookings', bookingData);
      const createdBooking = response.data;
      
      // Create eway bill record if eway bill details are provided
      if (createdBooking.ewayBill && 
          createdBooking.ewayBill.trim() !== '' && 
          createdBooking.ewayBill.trim().toUpperCase() !== 'NO EWAY' &&
          formData.ewayBillDetails.generatedDate && 
          formData.ewayBillDetails.expiryDate) {
        
        try {
          await axios.post('/api/eway-bills', {
            bookingId: createdBooking.id,
            ewayBillNumber: createdBooking.ewayBill,
            generatedDate: formData.ewayBillDetails.generatedDate,
            expiryDate: formData.ewayBillDetails.expiryDate,
            billValue: formData.ewayBillDetails.billValue || 0,
            transporterId: createdBooking.transporterId
          });
          console.log('Eway bill record created successfully');
        } catch (ewayError) {
          console.error('Error creating eway bill record:', ewayError);
          // Don't fail the booking creation if eway bill record creation fails
        }
      }
      
      // Invalidate dashboard cache to ensure fresh data
      performanceOptimizer.clearCacheEntry('bookings');
      performanceOptimizer.clearCacheEntry('challans');
      
      navigate('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Error creating booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
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
        return formData.packages && formData.packages.length > 0 && 
               formData.packages.every(pkg => 
                 pkg.numberOfItems && pkg.packagingType && pkg.itemDescription
               );
      case 3:
        return formData.totalWeight && parseFloat(formData.totalWeight) > 0 &&
               formData.packages && formData.packages.length > 0 &&
               formData.packages.every(pkg => pkg.weightKg && parseFloat(pkg.weightKg) > 0);
      case 4:
        return formData.invoices && formData.invoices.length > 0 && 
               formData.invoices.every(invoice => 
                 invoice.invoiceNo && invoice.invoiceValue
               );
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

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <BookingHeader 
          title="Create New Booking"
          subtitle="Add a new booking step by step"
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
            submitText="Create Booking"
            submittingText="Creating..."
          />
        </FormContainer>
      </div>
    </div>
  );
};

export default CreateBookingPage; 