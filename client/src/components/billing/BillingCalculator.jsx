import { useState, useEffect } from 'react';
import axios from 'axios';

const BillingCalculator = () => {
  const [transporters, setTransporters] = useState([]);
  const [selectedTransporter, setSelectedTransporter] = useState('');
  const [billingData, setBillingData] = useState({
    weight_in_kg: '',
    rate_per_kg: '',
    commission_rate_percent: '',
    local_cartage_charges: '',
    paid_amount_by_transporter: ''
  });
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransporters();
  }, []);

  const fetchTransporters = async () => {
    try {
      const response = await axios.get('/api/transporters');
      setTransporters(response.data);
    } catch (error) {
      console.error('Error fetching transporters:', error);
    }
  };

  const handleTransporterChange = (transporterId) => {
    setSelectedTransporter(transporterId);
    const transporter = transporters.find(t => t.id === transporterId);
    if (transporter) {
      setBillingData(prev => ({
        ...prev,
        commission_rate_percent: transporter.commissionRate.toString()
      }));
    }
  };

  const calculateBilling = () => {
    const {
      weight_in_kg,
      rate_per_kg,
      commission_rate_percent,
      local_cartage_charges,
      paid_amount_by_transporter
    } = billingData;

    // Convert to numbers
    const weight = parseFloat(weight_in_kg) || 0;
    const rate = parseFloat(rate_per_kg) || 0;
    const commissionRate = parseFloat(commission_rate_percent) || 0; // This is now rupees per kg
    const localCartage = parseFloat(local_cartage_charges) || 0;
    const paidAmount = parseFloat(paid_amount_by_transporter) || 0;

    // Calculate commission amount using rupees per kg logic
    const commission_amount = weight * commissionRate;

    // Add local cartage charges to commission amount
    const total_due = commission_amount + localCartage;

    // Subtract paid amount to get pending amount
    const remaining_amount = total_due - paidAmount;

    setCalculation({
      total_amount: weight * rate, // For reference only
      commission_amount,
      total_due,
      paid_amount: paidAmount,
      remaining_amount
    });
  };

  const handleInputChange = (field, value) => {
    setBillingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (number) => {
    return number.toLocaleString('en-IN');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Billing Calculator</h2>
          <p className="text-sm text-gray-600">Calculate billing amounts for transporters</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Transporter Selection */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transporter
            </label>
            <select
              value={selectedTransporter}
              onChange={(e) => handleTransporterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Transporter</option>
              {transporters.map((transporter) => (
                <option key={transporter.id} value={transporter.id}>
                  {transporter.name} (Commission: ₹{transporter.commissionRate} per kg)
                </option>
              ))}
            </select>
          </div>

          {/* Weight in KG */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weight in KG
            </label>
            <input
              type="number"
              step="0.01"
              value={billingData.weight_in_kg}
              onChange={(e) => handleInputChange('weight_in_kg', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 144320"
            />
          </div>

          {/* Rate per KG */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rate per KG
            </label>
            <input
              type="number"
              step="0.01"
              value={billingData.rate_per_kg}
              onChange={(e) => handleInputChange('rate_per_kg', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 105"
            />
          </div>

          {/* Commission Rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Commission Rate (₹ per kg)
            </label>
            <input
              type="number"
              step="0.01"
              value={billingData.commission_rate_percent}
              onChange={(e) => handleInputChange('commission_rate_percent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 1.05"
            />
          </div>

          {/* Local Cartage Charges */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Local Cartage Charges
            </label>
            <input
              type="number"
              step="0.01"
              value={billingData.local_cartage_charges}
              onChange={(e) => handleInputChange('local_cartage_charges', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 500"
            />
          </div>

          {/* Paid Amount by Transporter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Paid Amount by Transporter
            </label>
            <input
              type="number"
              step="0.01"
              value={billingData.paid_amount_by_transporter}
              onChange={(e) => handleInputChange('paid_amount_by_transporter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 1000"
            />
          </div>
        </div>

        {/* Calculate Button */}
        <div className="mt-4">
          <button
            onClick={calculateBilling}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-md"
          >
            Calculate Billing
          </button>
        </div>
      </div>

      {/* Results */}
      {calculation && (
        <div className="animate-fadeIn">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Calculation Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-600 mb-1">Total Amount</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(calculation.total_amount)}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs font-medium text-green-600 mb-1">Commission Amount</p>
                <p className="text-lg font-bold text-green-900">{formatCurrency(calculation.commission_amount)}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs font-medium text-purple-600 mb-1">Total Due</p>
                <p className="text-lg font-bold text-purple-900">{formatCurrency(calculation.total_due)}</p>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs font-medium text-orange-600 mb-1">Remaining Amount</p>
                <p className="text-lg font-bold text-orange-900">{formatCurrency(calculation.remaining_amount)}</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Paid Amount</p>
                <p className="text-base font-semibold text-gray-900">{formatCurrency(calculation.paid_amount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingCalculator; 