import React, { useState, useEffect } from 'react';

const ExpenseModal = ({ expense, vehicles, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    expenseType: '',
    amount: '',
    description: '',
    vehicleId: '',
    location: '',
    receiptNumber: '',
    paymentMethod: 'cash'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (expense) {
      setFormData({
        date: expense.date.split('T')[0],
        expenseType: expense.expenseType,
        amount: expense.amount.toString(),
        description: expense.description || '',
        vehicleId: expense.vehicleId || '',
        location: expense.location || '',
        receiptNumber: expense.receiptNumber || '',
        paymentMethod: expense.paymentMethod || 'cash'
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        expenseType: '',
        amount: '',
        description: '',
        vehicleId: '',
        location: '',
        receiptNumber: '',
        paymentMethod: 'cash'
      });
    }
  }, [expense]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.expenseType) newErrors.expenseType = 'Expense type is required';
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    // Vehicle is required only for vehicle-related expenses
    const vehicleRelatedExpenses = ['fuel', 'toll', 'maintenance', 'insurance'];
    if (vehicleRelatedExpenses.includes(formData.expenseType) && !formData.vehicleId) {
      newErrors.vehicleId = 'Vehicle is required for this expense type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount)
      });
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear vehicle field when switching to non-vehicle expense type
    if (field === 'expenseType') {
      const vehicleRelatedExpenses = ['fuel', 'toll', 'maintenance', 'insurance'];
      if (!vehicleRelatedExpenses.includes(value)) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          vehicleId: '' // Clear vehicle selection
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };



  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
      isVisible ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0'
    }`}>
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden transition-all duration-300 transform ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {expense ? 'Edit Expense' : 'Add New Expense'}
                </h2>
                <p className="text-xs text-gray-600">
                  {expense ? 'Update expense details' : 'Track your transport expense'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-200 transform hover:scale-110"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              />
              {errors.date && (
                <p className="text-xs text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Expense Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Expense Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.expenseType}
                onChange={(e) => handleInputChange('expenseType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white"
              >
                <option value="">Select type</option>
                <option value="fuel">Fuel</option>
                <option value="toll">Toll & Permits</option>
                <option value="maintenance">Vehicle Maintenance</option>
                <option value="insurance">Insurance</option>
                <option value="mobile_internet">Mobile & Internet</option>
                <option value="household">Household</option>
                <option value="emi">EMIs</option>
                <option value="labour">Labour Payment</option>
                <option value="salary">Salary</option>
                <option value="office_rent">Office Rent</option>
                <option value="utilities">Utilities</option>
                <option value="marketing">Marketing & Advertising</option>
                <option value="legal">Legal & Professional</option>
                <option value="travel">Travel & Accommodation</option>
                <option value="stationery">Stationery & Supplies</option>
                <option value="repairs">Repairs & Renovation</option>
                <option value="taxes">Taxes & Compliance</option>
            <option value="bank_charges">Bank Charges</option>
            <option value="gaadi_bhaada">Gaadi Bhaada</option>
            <option value="misc">Miscellaneous</option>
              </select>
              {errors.expenseType && (
                <p className="text-xs text-red-600">{errors.expenseType}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">₹</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Vehicle - Only show for vehicle-related expenses */}
            {['fuel', 'toll', 'maintenance', 'insurance'].includes(formData.expenseType) && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white"
                >
                  <option value="">Select vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicleNumber} - {vehicle.type}
                    </option>
                  ))}
                </select>
                {errors.vehicleId && (
                  <p className="text-xs text-red-600">{errors.vehicleId}</p>
                )}
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="net_banking">Net Banking</option>
              </select>
            </div>

            {/* Receipt Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Receipt Number
              </label>
              <input
                type="text"
                value={formData.receiptNumber}
                onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                placeholder="Enter receipt number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter expense description"
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{expense ? 'Update Expense' : 'Add Expense'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal; 