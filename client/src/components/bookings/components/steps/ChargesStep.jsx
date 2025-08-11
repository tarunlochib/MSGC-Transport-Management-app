import React from 'react';

const ChargesStep = ({ 
  formData, 
  setFormData, 
  vehicles, 
  drivers, 
  calculateTotalCharges 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Charges & Assignment</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Payment Method
          </label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => {
              const paymentMethod = e.target.value;
              setFormData({ ...formData, paymentMethod: paymentMethod });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          >
            <option value="">Select Payment Method</option>
            <option value="Paid">Paid</option>
            <option value="To Pay">To Pay</option>
            <option value="To be billed">To be billed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Delivery Against
          </label>
          <select
            value={formData.deliveryAgainst}
            onChange={(e) => setFormData({ ...formData, deliveryAgainst: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          >
            <option value="">Select Delivery Method</option>
            <option value="OTP">OTP</option>
            <option value="CC ATTACHED">CC ATTACHED</option>
            <option value="DACC">DACC</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Freight Charges
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.freightCharges}
            onChange={(e) => {
              setFormData({ ...formData, freightCharges: e.target.value });
              setTimeout(() => calculateTotalCharges(), 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Local Cartage
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.localCartageCharges}
            onChange={(e) => {
              setFormData({ ...formData, localCartageCharges: e.target.value });
              setTimeout(() => calculateTotalCharges(), 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Door Delivery
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.doorDeliveryCharges}
            onChange={(e) => {
              setFormData({ ...formData, doorDeliveryCharges: e.target.value });
              setTimeout(() => calculateTotalCharges(), 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Stationary
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.stationaryCharges}
            onChange={(e) => {
              setFormData({ ...formData, stationaryCharges: e.target.value });
              setTimeout(() => calculateTotalCharges(), 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Labour Charges
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.labourCharges}
            onChange={(e) => {
              setFormData({ ...formData, labourCharges: e.target.value });
              setTimeout(() => calculateTotalCharges(), 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Other Charges
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.otherCharges}
            onChange={(e) => {
              setFormData({ ...formData, otherCharges: e.target.value });
              setTimeout(() => calculateTotalCharges(), 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="0.00"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Total Charges (Auto-calculated)
          </label>
          <input
            type="number"
            step="0.01"
            value={calculateTotalCharges()}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-sm"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Vehicle (Optional)
          </label>
          <select
            value={formData.vehicleId}
            onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vehicleNumber} - {vehicle.type}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
            Driver (Optional)
          </label>
          <select
            value={formData.driverId}
            onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          >
            <option value="">Select Driver</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ChargesStep; 