import React from 'react';
import AutocompleteInput from '../../../common/AutocompleteInput';

const ConsignorDetailsStep = ({ formData, setFormData, customers, handleGSTChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Consignor Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AutocompleteInput
            label="Consignor Name"
            value={formData.consignorName}
            onChange={(value) => setFormData({ ...formData, consignorName: value })}
            onSelect={(customer) => {
              setFormData(prev => ({
                ...prev,
                consignorName: customer.name,
                consignorAddress: customer.address,
                consignorGST: customer.gstNumber,
                consignorId: customer.id
              }));
            }}
            suggestions={customers || []}
            placeholder="Type to search customers..."
            required
            showGST
            showAddress
          />
        </div>
        
        <div>
          <AutocompleteInput
            label="Consignor GST Number"
            value={formData.consignorGST}
            onChange={(value) => {
              setFormData({ ...formData, consignorGST: value });
              if (value.length >= 15) {
                handleGSTChange('consignor', value);
              }
            }}
            onSelect={(customer) => {
              setFormData(prev => ({
                ...prev,
                consignorName: customer.name,
                consignorAddress: customer.address,
                consignorGST: customer.gstNumber,
                consignorId: customer.id
              }));
            }}
            suggestions={customers || []}
            placeholder="Type GST number to search..."
            showGST
            showAddress
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Consignor Address *
        </label>
        <textarea
          value={formData.consignorAddress}
          onChange={(e) => setFormData({ ...formData, consignorAddress: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          required
          placeholder="Enter complete address"
        />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
          Select from Existing Customers
        </label>
        <select
          value={formData.consignorId || ''}
          onChange={(e) => {
            const customerId = e.target.value;
            
            if (customerId && customers && customers.length > 0) {
              const customer = customers.find(c => c.id === customerId);
              
              if (customer) {
                setFormData(prevData => ({
                  ...prevData,
                  consignorName: customer.name || '',
                  consignorAddress: customer.address || '',
                  consignorGST: customer.gstNumber || '',
                  consignorId: customer.id
                }));
              }
            } else {
              // Clear the fields when "Select from existing customers" is chosen
              setFormData(prevData => ({
                ...prevData,
                consignorName: '',
                consignorAddress: '',
                consignorGST: '',
                consignorId: ''
              }));
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
        >
          <option value="">Select from existing customers</option>
          {customers && customers.length > 0 ? (
            customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.gstNumber || 'No GST'}
              </option>
            ))
          ) : (
            <option value="" disabled>No customers available</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default ConsignorDetailsStep; 