import React, { useState } from 'react';

const RouteDetailsStep = ({ formData, setFormData }) => {
  const [showEwayBillDetails, setShowEwayBillDetails] = useState(false);

  // Show eway bill details section when eway bill number is provided and not "NO EWAY"
  const shouldShowEwayBillDetails = formData.ewayBill && 
    formData.ewayBill.trim() !== '' && 
    formData.ewayBill.trim().toUpperCase() !== 'NO EWAY';

  const handleEwayBillChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, ewayBill: value });
    
    // Show/hide eway bill details based on input
    if (value && value.trim() !== '' && value.trim().toUpperCase() !== 'NO EWAY') {
      setShowEwayBillDetails(true);
    } else {
      setShowEwayBillDetails(false);
      setFormData({ 
        ...formData, 
        ewayBill: value,
        ewayBillDetails: { generatedDate: '', expiryDate: '', billValue: '' }
      });
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Route Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            From Location *
          </label>
          <input
            type="text"
            value={formData.fromLocation}
            onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            required
            placeholder="Enter pickup location"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            To Location *
          </label>
          <input
            type="text"
            value={formData.toLocation}
            onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            required
            placeholder="Enter delivery location"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            E-Way Bill Number
          </label>
          <input
            type="text"
            value={formData.ewayBill}
            onChange={handleEwayBillChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="Enter e-way bill number or 'NO EWAY'"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Private Marka
          </label>
          <input
            type="text"
            value={formData.privateMarka}
            onChange={(e) => setFormData({ ...formData, privateMarka: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="Enter private marka"
          />
        </div>
      </div>

      {/* Eway Bill Tracking Details */}
      {shouldShowEwayBillDetails && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-orange-800">Eway Bill Tracking Details</h4>
            <p className="text-xs text-orange-600 ml-2">(Optional - for tracking expiry dates)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Generated Date
              </label>
              <input
                type="date"
                value={formData.ewayBillDetails?.generatedDate || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ewayBillDetails: { ...formData.ewayBillDetails, generatedDate: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
                placeholder="Select generated date"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.ewayBillDetails?.expiryDate || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ewayBillDetails: { ...formData.ewayBillDetails, expiryDate: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
                placeholder="Select expiry date"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                Bill Value (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.ewayBillDetails?.billValue || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ewayBillDetails: { ...formData.ewayBillDetails, billValue: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
                placeholder="Enter bill value"
              />
            </div>
          </div>
          
          <div className="mt-3 flex items-center text-xs text-orange-700">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>These details will be used for eway bill expiration tracking. You can add them later from the Eway Bill Tracker page.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDetailsStep; 