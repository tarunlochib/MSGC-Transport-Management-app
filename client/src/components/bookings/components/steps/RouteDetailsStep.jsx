import React from 'react';

const RouteDetailsStep = ({ formData, setFormData }) => {
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
            onChange={(e) => setFormData({ ...formData, ewayBill: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="Enter e-way bill number"
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
    </div>
  );
};

export default RouteDetailsStep; 