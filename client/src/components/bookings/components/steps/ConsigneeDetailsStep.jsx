import React from 'react';
import AutocompleteInput from '../../../common/AutocompleteInput';

const ConsigneeDetailsStep = ({ formData, setFormData, customers, handleGSTChange }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Consignee Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <AutocompleteInput
            label="Consignee Name"
            value={formData.consigneeName}
            onChange={(value) => setFormData({ ...formData, consigneeName: value })}
            onSelect={(customer) => {
              setFormData(prev => ({
                ...prev,
                consigneeName: customer.name,
                consigneeAddress: customer.address,
                consigneeGST: customer.gstNumber,
                consigneeId: customer.id
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
            label="Consignee GST Number"
            value={formData.consigneeGST}
            onChange={(value) => {
              setFormData({ ...formData, consigneeGST: value });
              if (value.length >= 15) {
                handleGSTChange('consignee', value);
              }
            }}
            onSelect={(customer) => {
              setFormData(prev => ({
                ...prev,
                consigneeName: customer.name,
                consigneeAddress: customer.address,
                consigneeGST: customer.gstNumber,
                consigneeId: customer.id
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
          Consignee Address *
        </label>
        <textarea
          value={formData.consigneeAddress}
          onChange={(e) => setFormData({ ...formData, consigneeAddress: e.target.value })}
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
          value={formData.consigneeId || ''}
          onChange={(e) => {
            const customerId = e.target.value;
            
            if (customerId && customers && customers.length > 0) {
              const customer = customers.find(c => c.id === customerId);
              
              if (customer) {
                setFormData(prevData => ({
                  ...prevData,
                  consigneeName: customer.name || '',
                  consigneeAddress: customer.address || '',
                  consigneeGST: customer.gstNumber || '',
                  consigneeId: customer.id
                }));
              }
            } else {
              // Clear the fields when "Select from existing customers" is chosen
              setFormData(prevData => ({
                ...prevData,
                consigneeName: '',
                consigneeAddress: '',
                consigneeGST: '',
                consigneeId: ''
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

export default ConsigneeDetailsStep; 